from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.admin.settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.repositories.admin.settings_repository import settings_repo

class SettingsService:
    async def get_settings(self, db: AsyncSession) -> RestaurantSettingsResponse:
        db_settings = await settings_repo.get_all(db)
        settings_dict = {s.setting_key: s.setting_value for s in db_settings}
        
        # Provide defaults if not exist
        return RestaurantSettingsResponse(
            restaurant_name=settings_dict.get("restaurant_name", "My Restaurant"),
            logo_url=settings_dict.get("logo_url"),
            address=settings_dict.get("address", ""),
            contact_email=settings_dict.get("contact_email", ""),
            contact_phone=settings_dict.get("contact_phone", ""),
            currency=settings_dict.get("currency", "USD"),
            gst_percentage=float(settings_dict.get("gst_percentage", 0.0)),
            service_charge_percentage=float(settings_dict.get("service_charge_percentage", 0.0)),
            business_hours=settings_dict.get("business_hours", "")
        )

    async def update_settings(self, db: AsyncSession, settings_in: RestaurantSettingsUpdate) -> RestaurantSettingsResponse:
        settings_dict = settings_in.model_dump(exclude_unset=True)
        
        for key, value in settings_dict.items():
            if value is not None:
                await settings_repo.update_or_create(db, key, str(value))
                
        return await self.get_settings(db)

settings_service = SettingsService()
