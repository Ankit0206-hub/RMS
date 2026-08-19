from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.billing_repository import BillingRepository
from app.repositories.ordering_repository import OrderingRepository
from app.repositories.admin.menu_repository import MenuRepository
from app.schemas.billing import BillCreate, PaymentCreate
from app.core.exceptions import NotFoundException, BusinessRuleException
from app.services.admin.settings_service import settings_service
import uuid

class BillingService:
    def __init__(self):
        self.repository = BillingRepository()
        self.ordering_repository = OrderingRepository()
        self.menu_repository = MenuRepository()

    async def generate_bill(self, db: AsyncSession, session_id: int, employee_id: int = None, discount_percentage: float = 0.0):
        session = await self.ordering_repository.get_session_by_id(db, session_id)
        if not session:
            raise NotFoundException("Session not found")
            
        existing_bill = await self.repository.get_bill_by_session(db, session_id)
        if existing_bill:
            if existing_bill.payment_status == "Paid":
                raise BusinessRuleException("Cannot regenerate a paid bill")
            # Delete the outdated unpaid bill so we can regenerate it
            await db.delete(existing_bill)
            await db.commit()
            
        subtotal = 0.0
        items_data = []
        
        # Aggregate items across all orders in the session
        grouped_items = {}
        for order in session.orders:
            if order.status == "Verification Pending":
                raise BusinessRuleException("Cannot generate a bill because there are orders pending verification. Please accept or reject them first.")
            if order.status not in ["Cancelled"]: # Count everything that wasn't cancelled
                for item in order.items:
                    menu_item = await self.menu_repository.get_by_id(db, item.menu_item_id)
                    base_name = menu_item.name if menu_item else "Unknown Item"
                    
                    # Handle customizations text
                    addons_text = ""
                    portion_text = ""
                    if item.customizations:
                        if isinstance(item.customizations, dict):
                            cust = item.customizations
                            if cust.get("portion"):
                                portion_text = f" ({cust['portion']})"
                            if cust.get("addons") and isinstance(cust["addons"], list):
                                addons_text = f" + {', '.join([a['name'] for a in cust['addons']])}"
                                
                    display_name = f"{base_name}{portion_text}{addons_text}"
                    price = float(item.price_at_order)
                    group_key = (item.menu_item_id, price, display_name)
                    
                    if group_key not in grouped_items:
                        grouped_items[group_key] = {
                            "menu_item_id": item.menu_item_id,
                            "item_name": display_name,
                            "quantity": 0,
                            "price": price,
                            "total": 0.0
                        }
                    
                    grouped_items[group_key]["quantity"] += item.quantity
                    grouped_items[group_key]["total"] += float(item.quantity * price)
                    subtotal += float(item.quantity * price)

        items_data = list(grouped_items.values())

        import math
        # Load settings for taxes and fees
        settings = await settings_service.get_settings(db)
        cgst = settings.cgst_percentage / 100.0
        sgst = settings.sgst_percentage / 100.0
        service_charge_pct = settings.service_charge_percentage / 100.0

        total_tax = subtotal * (cgst + sgst)
        service_charge = subtotal * service_charge_pct
        
        pre_discount_total = subtotal + total_tax + service_charge
        total_discount = pre_discount_total * (discount_percentage / 100.0) if discount_percentage else 0.0
        grand_total = float(math.ceil(pre_discount_total - total_discount))

        bill_data = {
            "session_id": session_id,
            "bill_number": f"BILL-{uuid.uuid4().hex[:8].upper()}",
            "generated_by_employee_id": employee_id,
            "subtotal": subtotal,
            "total_tax": total_tax,
            "total_discount": total_discount,
            "service_charge": service_charge,
            "grand_total": grand_total,
            "payment_status": "Pending"
        }

        # Reset bill_requested flag now that bill is generated
        session.bill_requested = False
        db.add(session)
        # Commit will be handled inside create_bill implicitly or we should ensure it
        
        bill = await self.repository.create_bill(db, bill_data, items_data)
        
        # We need to explicitly commit the session update
        await db.commit()
        
        return bill

    async def get_bills(self, db: AsyncSession, page: int, page_size: int, payment_status: str = None):
        return await self.repository.get_bills(db, page, page_size, payment_status)

    async def get_bill(self, db: AsyncSession, bill_id: int):
        bill = await self.repository.get_bill_by_id(db, bill_id)
        if not bill:
            raise NotFoundException("Bill not found")
        return bill
        
    async def add_payment(self, db: AsyncSession, bill_id: int, payment_in: PaymentCreate):
        bill = await self.repository.get_bill_by_id(db, bill_id)
        if not bill:
            raise NotFoundException("Bill not found")
            
        if bill.payment_status == "Paid":
            raise BusinessRuleException("Bill is already paid")
            
        payment_data = payment_in.model_dump()
        payment_data["status"] = "Completed"
        
        payment = await self.repository.add_payment(db, bill_id, payment_data)
        
        # Check if total payments cover grand total
        total_paid = sum(p.amount for p in bill.payments) + float(payment.amount)
        if total_paid >= float(bill.grand_total):
            await self.repository.update_bill_status(db, bill_id, "Paid")
            
                # Close the session
            session = await self.ordering_repository.get_session_by_id(db, bill.session_id)
            if session:
                session.status = "Completed"
                
                # Update all orders to Completed
                for order in session.orders:
                    if order.status not in ["Cancelled"]:
                        order.status = "Completed"
                
                # Also free up the table
                from app.models.restaurant import RestaurantTable
                table = await db.get(RestaurantTable, session.table_id)
                if table:
                    if table.is_virtual:
                        from sqlalchemy.future import select
                        result = await db.execute(select(RestaurantTable).where(RestaurantTable.parent_table_id == table.id))
                        children = result.scalars().all()
                        for child in children:
                            child.status = "Available"
                            child.parent_table_id = None
                        await db.delete(table)
                    else:
                        table.status = "Available"
                    
                await db.commit()
                
                # Broadcast the settlement event
                from app.websocket.connection_manager import manager
                await manager.broadcast("BILL_PAID", {
                    "session_id": session.id,
                    "table_id": table.table_number if table else None
                }, ["operator", "waiter"])
                await manager.notify_customer(session.id, "BILL_PAID", {
                    "message": "Payment successful."
                })
        
        return payment
