from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete
from app.models.restaurant import RestaurantSetting

class SettingsRepository:
    async def get_all(self, db: AsyncSession) -> List[RestaurantSetting]:
        result = await db.execute(select(RestaurantSetting))
        return result.scalars().all()

    async def get_by_key(self, db: AsyncSession, key: str) -> RestaurantSetting:
        result = await db.execute(select(RestaurantSetting).filter(RestaurantSetting.setting_key == key))
        return result.scalar_one_or_none()

    async def update_or_create(self, db: AsyncSession, key: str, value: str) -> RestaurantSetting:
        setting = await self.get_by_key(db, key)
        if setting:
            setting.setting_value = str(value)
        else:
            setting = RestaurantSetting(setting_key=key, setting_value=str(value))
            db.add(setting)
        
        await db.commit()
        await db.refresh(setting)
        return setting

settings_repo = SettingsRepository()
