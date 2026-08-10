import json
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.admin.settings import RestaurantSettingsUpdate, RestaurantSettingsResponse
from app.repositories.admin.settings_repository import settings_repo

class SettingsService:
    async def get_settings(self, db: AsyncSession) -> RestaurantSettingsResponse:
        db_settings = await settings_repo.get_all(db)
        settings_dict = {s.setting_key: s.setting_value for s in db_settings}
        
        def parse_json_list(val, default=None):
            if not val:
                return default or []
            try:
                return json.loads(val)
            except:
                return default or []
                
        def parse_bool(val, default=False):
            if val is None:
                return default
            return str(val).lower() == "true"
            
        def parse_int(val, default=0):
            if not val:
                return default
            try:
                return int(val)
            except:
                return default
        def parse_json_dict(val, default=None):
            if not val:
                return default or {}
            try:
                return json.loads(val)
            except:
                return default or {}
        
        # Provide defaults if not exist
        return RestaurantSettingsResponse(
            restaurant_name=settings_dict.get("restaurant_name", "My Restaurant"),
            logo_url=settings_dict.get("logo_url"),
            address=settings_dict.get("address", ""),
            contact_email=settings_dict.get("contact_email", ""),
            contact_phone=settings_dict.get("contact_phone", ""),
            currency=settings_dict.get("currency", "USD"),
            gst_percentage=float(settings_dict.get("gst_percentage", 0.0)),
            cgst_percentage=float(settings_dict.get("cgst_percentage", 0.0)),
            sgst_percentage=float(settings_dict.get("sgst_percentage", 0.0)),
            service_charge_percentage=float(settings_dict.get("service_charge_percentage", 0.0)),
            business_hours=settings_dict.get("business_hours", ""),
            opening_time=settings_dict.get("opening_time"),
            closing_time=settings_dict.get("closing_time"),
            is_closed_early=parse_bool(settings_dict.get("is_closed_early")),
            holidays=parse_json_list(settings_dict.get("holidays")),
            merged_table_initial=settings_dict.get("merged_table_initial", "M-"),
            normal_table_prefix=settings_dict.get("normal_table_prefix", "T-"),
            table_naming_convention=settings_dict.get("table_naming_convention", "Numeric"),
            total_tables=parse_int(settings_dict.get("total_tables")),
            floors_or_areas=parse_json_list(settings_dict.get("floors_or_areas")),
            floor_prefixes=parse_json_dict(settings_dict.get("floor_prefixes"))
        )

    async def update_settings(self, db: AsyncSession, settings_in: RestaurantSettingsUpdate) -> RestaurantSettingsResponse:
        settings_dict = settings_in.model_dump(exclude_unset=True)
        
        for key, value in settings_dict.items():
            if value is not None:
                if isinstance(value, list) or isinstance(value, dict):
                    str_val = json.dumps(value)
                elif isinstance(value, bool):
                    str_val = "true" if value else "false"
                else:
                    str_val = str(value)
                await settings_repo.update_or_create(db, key, str_val)
                
        return await self.get_settings(db)

settings_service = SettingsService()
