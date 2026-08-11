import sys
import os
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.db.database import AsyncSessionLocal, engine
from app.models.menu import MenuCategory, MenuItem, VariantGroup, VariantItem, AddonGroup, AddonItem
from app.models.kitchen import Kitchen

async def seed():
    print("Generating real menu items...")
    
    async with AsyncSessionLocal() as session:
        # Fetch or create Kitchens
        kits = (await session.execute(select(Kitchen))).scalars().all()
        main_kit = next((k for k in kits if 'Main' in k.name), None)
        if not main_kit:
            main_kit = Kitchen(name="Main Kitchen", description="Handles all vegetarian and general items")
            session.add(main_kit)
            
        nonveg_kit = next((k for k in kits if 'Non-Veg' in k.name), None)
        if not nonveg_kit:
            nonveg_kit = Kitchen(name="Non-Veg Kitchen", description="Specialized for all non-vegetarian items")
            session.add(nonveg_kit)
            
        # Fetch or create Categories
        cats = (await session.execute(select(MenuCategory))).scalars().all()
        
        starters_cat = next((c for c in cats if c.name == 'Starters'), None)
        if not starters_cat:
            starters_cat = MenuCategory(name="Starters", description="Appetizers and quick bites")
            session.add(starters_cat)
            
        main_course_cat = next((c for c in cats if c.name == 'Main Course'), None)
        if not main_course_cat:
            main_course_cat = MenuCategory(name="Main Course", description="Heavy dishes for main meals")
            session.add(main_course_cat)
            
        desert_cat = next((c for c in cats if c.name == 'Desserts'), None)
        if not desert_cat:
            desert_cat = MenuCategory(name="Desserts", description="Sweet dishes to end your meal")
            session.add(desert_cat)
            
        await session.flush()
            
        items_data = [
            # Starters
            {
                "cat": starters_cat.id, "kitchen": main_kit.id,
                "code": "REAL_S01", "name": "Paneer Tikka", "price": 250, "is_veg": True, "type": "veg",
                "desc": "Cottage cheese marinated in yogurt and spices, grilled to perfection.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 150)]},
                "addons": {"name": "Extras", "options": [("Extra Mint Chutney", 20)]}
            },
            {
                "cat": starters_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_S02", "name": "Chicken Tikka", "price": 300, "is_veg": False, "type": "non-veg",
                "desc": "Tender chicken pieces marinated in spicy yogurt and roasted.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 180)]},
                "addons": {"name": "Extras", "options": [("Extra Mint Chutney", 20)]}
            },
            {
                "cat": starters_cat.id, "kitchen": main_kit.id,
                "code": "REAL_S03", "name": "Crispy Corn", "price": 200, "is_veg": True, "type": "veg",
                "desc": "Golden fried sweet corn kernels tossed with spices.",
                "variants": {"name": "Size", "options": [("Regular", 0), ("Large", 100)]},
                "addons": None
            },
            {
                "cat": starters_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_S04", "name": "Chilli Chicken", "price": 320, "is_veg": False, "type": "non-veg",
                "desc": "A sweet, spicy and slightly sour crispy appetizer made with chicken.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 190)]},
                "addons": None
            },
            {
                "cat": starters_cat.id, "kitchen": main_kit.id,
                "code": "REAL_S05", "name": "Hara Bhara Kabab", "price": 220, "is_veg": True, "type": "veg",
                "desc": "Healthy and delicious Indian vegetarian snack made with spinach and green peas.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 120)]},
                "addons": None
            },
            {
                "cat": starters_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_S06", "name": "Tandoori Chicken", "price": 350, "is_veg": False, "type": "non-veg",
                "desc": "Chicken dish prepared by roasting chicken marinated in yogurt and spices in a tandoor.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 200)]},
                "addons": {"name": "Sides", "options": [("Extra Salad", 30)]}
            },
            {
                "cat": starters_cat.id, "kitchen": main_kit.id,
                "code": "REAL_S07", "name": "Veg Manchurian", "price": 240, "is_veg": True, "type": "veg",
                "desc": "Deep fried vegetable balls in a soy sauce based gravy.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 140)]},
                "addons": None
            },
            {
                "cat": starters_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_S08", "name": "Mutton Seekh Kabab", "price": 400, "is_veg": False, "type": "non-veg",
                "desc": "Spiced minced mutton formed into cylinders on skewers and grilled.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 250)]},
                "addons": None
            },
            {
                "cat": starters_cat.id, "kitchen": main_kit.id,
                "code": "REAL_S09", "name": "Spring Rolls", "price": 180, "is_veg": True, "type": "veg",
                "desc": "Crispy rolls filled with savory mixed vegetables.",
                "variants": {"name": "Quantity", "options": [("4 pcs", 0), ("8 pcs", 150)]},
                "addons": {"name": "Dips", "options": [("Sweet Chilli Sauce", 20)]}
            },
            {
                "cat": starters_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_S10", "name": "Fish Amritsari", "price": 380, "is_veg": False, "type": "non-veg",
                "desc": "Spicy, tangy and deep fried fish snack from Punjab.",
                "variants": {"name": "Size", "options": [("Regular", 0)]},
                "addons": {"name": "Dips", "options": [("Tartar Sauce", 30)]}
            },
            
            # Main Course
            {
                "cat": main_course_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_M01", "name": "Butter Chicken", "price": 380, "is_veg": False, "type": "non-veg",
                "desc": "Classic Indian dish with grilled chicken cooked in a smooth buttery and creamy tomato gravy.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 200)]},
                "addons": {"name": "Extras", "options": [("Extra Butter", 30), ("Butter Naan", 40)]}
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M02", "name": "Paneer Butter Masala", "price": 320, "is_veg": True, "type": "veg",
                "desc": "Rich and creamy dish of paneer in a tomato, butter and cashew sauce.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 160)]},
                "addons": {"name": "Extras", "options": [("Extra Butter", 30)]}
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M03", "name": "Dal Makhani", "price": 280, "is_veg": True, "type": "veg",
                "desc": "Slow cooked black lentils and kidney beans with butter and cream.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 140)]},
                "addons": {"name": "Extras", "options": [("Extra Cream", 25)]}
            },
            {
                "cat": main_course_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_M04", "name": "Mutton Rogan Josh", "price": 450, "is_veg": False, "type": "non-veg",
                "desc": "Aromatic curried meat dish of Persian or Kashmiri origin.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 250)]},
                "addons": None
            },
            {
                "cat": main_course_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_M05", "name": "Chicken Biryani", "price": 350, "is_veg": False, "type": "non-veg",
                "desc": "Fragrant basmati rice cooked with aromatic biryani spices, herbs & boiled eggs to yield a delicious one-pot dish.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 180)]},
                "addons": {"name": "Sides", "options": [("Raita", 50), ("Extra Egg", 20)]}
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M06", "name": "Veg Biryani", "price": 280, "is_veg": True, "type": "veg",
                "desc": "Aromatic rice dish made with basmati rice, spices & mixed veggies.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 140)]},
                "addons": {"name": "Sides", "options": [("Raita", 50)]}
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M07", "name": "Kadai Paneer", "price": 300, "is_veg": True, "type": "veg",
                "desc": "Spicy, warming, flavorful and super delicious dish made by cooking paneer & bell peppers in a fragrant, freshly ground spice powder.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 150)]},
                "addons": None
            },
            {
                "cat": main_course_cat.id, "kitchen": nonveg_kit.id,
                "code": "REAL_M08", "name": "Fish Curry", "price": 400, "is_veg": False, "type": "non-veg",
                "desc": "Simple, delicious & flavorful Indian fish curry.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 200)]},
                "addons": None
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M09", "name": "Malai Kofta", "price": 330, "is_veg": True, "type": "veg",
                "desc": "Fried dumpling balls made of mashed potatoes, paneer, and veggies in a rich gravy.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 170)]},
                "addons": None
            },
            {
                "cat": main_course_cat.id, "kitchen": main_kit.id,
                "code": "REAL_M10", "name": "Palak Paneer", "price": 310, "is_veg": True, "type": "veg",
                "desc": "Classic Indian dish consisting of paneer in a thick paste made from puréed spinach and seasoned with garlic, garam masala, and other spices.",
                "variants": {"name": "Portion", "options": [("Half", 0), ("Full", 155)]},
                "addons": None
            },

            # Desserts
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D01", "name": "Gulab Jamun", "price": 80, "is_veg": True, "type": "veg",
                "desc": "Soft, melt-in-your-mouth, fried dumplings traditionally made of thickened or reduced milk and soaked in rose-flavored sugar syrup.",
                "variants": {"name": "Quantity", "options": [("1 pc", 0), ("2 pcs", 60)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D02", "name": "Rasmalai", "price": 100, "is_veg": True, "type": "veg",
                "desc": "Soft cottage cheese balls immersed in chilled creamy milk.",
                "variants": {"name": "Quantity", "options": [("1 pc", 0), ("2 pcs", 80)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D03", "name": "Chocolate Brownie", "price": 150, "is_veg": False, "type": "egg",
                "desc": "Fudgy, gooey, and extremely chocolatey brownie.",
                "variants": {"name": "Size", "options": [("Regular", 0)]},
                "addons": {"name": "Sides", "options": [("Vanilla Ice Cream", 50), ("Chocolate Sauce", 20)]}
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D04", "name": "Gajar ka Halwa", "price": 120, "is_veg": True, "type": "veg",
                "desc": "Traditional Indian sweet made with grated carrots, milk, sugar, and ghee.",
                "variants": {"name": "Portion", "options": [("100g", 0), ("200g", 100)]},
                "addons": {"name": "Toppings", "options": [("Extra Dry Fruits", 30)]}
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D05", "name": "Kheer", "price": 110, "is_veg": True, "type": "veg",
                "desc": "Indian rice pudding made with basmati rice, milk, nuts, and saffron.",
                "variants": {"name": "Size", "options": [("Regular", 0), ("Large", 80)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D06", "name": "Mango Cheesecake", "price": 180, "is_veg": False, "type": "egg",
                "desc": "Creamy, rich cheesecake topped with fresh mango puree.",
                "variants": {"name": "Slice", "options": [("1 slice", 0)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D07", "name": "Tiramisu", "price": 200, "is_veg": False, "type": "egg",
                "desc": "Coffee-flavoured Italian dessert.",
                "variants": {"name": "Portion", "options": [("Regular", 0)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D08", "name": "Red Velvet Cake", "price": 160, "is_veg": False, "type": "egg",
                "desc": "Deliciously soft and moist red velvet cake with cream cheese frosting.",
                "variants": {"name": "Slice", "options": [("1 slice", 0)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D09", "name": "Kulfi Falooda", "price": 140, "is_veg": True, "type": "veg",
                "desc": "Traditional Indian ice cream served with falooda noodles.",
                "variants": {"name": "Portion", "options": [("Regular", 0)]},
                "addons": None
            },
            {
                "cat": desert_cat.id, "kitchen": main_kit.id,
                "code": "REAL_D10", "name": "Rabdi", "price": 130, "is_veg": True, "type": "veg",
                "desc": "Sweet, condensed-milk-based dish made by boiling milk on low heat for a long time.",
                "variants": {"name": "Portion", "options": [("Regular", 0)]},
                "addons": {"name": "Toppings", "options": [("Almonds & Pistachios", 25)]}
            }
        ]

        for item_data in items_data:
            # Check if item exists
            stmt = select(MenuItem).where(MenuItem.item_code == item_data["code"])
            res = await session.execute(stmt)
            existing = res.scalars().first()
            if not existing:
                mi = MenuItem(
                    category_id=item_data["cat"],
                    kitchen_id=item_data["kitchen"],
                    item_code=item_data["code"],
                    name=item_data["name"],
                    description=item_data["desc"],
                    price=item_data["price"],
                    is_veg=item_data["is_veg"],
                    item_type=item_data["type"]
                )
                session.add(mi)
                await session.flush() # get mi.id
                
                # Add variants
                if item_data.get("variants"):
                    v_data = item_data["variants"]
                    vg = VariantGroup(menu_item_id=mi.id, name=v_data["name"])
                    session.add(vg)
                    await session.flush()
                    for i, (v_name, extra_price) in enumerate(v_data["options"]):
                        vi = VariantItem(group_id=vg.id, name=v_name, extra_price=extra_price, is_default=(i==0))
                        session.add(vi)
                
                # Add addons
                if item_data.get("addons"):
                    a_data = item_data["addons"]
                    ag = AddonGroup(menu_item_id=mi.id, name=a_data["name"], min_selections=0, max_selections=len(a_data["options"]))
                    session.add(ag)
                    await session.flush()
                    for a_name, a_price in a_data["options"]:
                        ai = AddonItem(group_id=ag.id, name=a_name, price=a_price, item_type=item_data["type"])
                        session.add(ai)
                        
        await session.commit()
        print("Successfully added 30 real menu items with variants and add-ons.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
