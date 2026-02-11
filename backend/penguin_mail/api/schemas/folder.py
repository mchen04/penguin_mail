from datetime import datetime
from typing import Optional

from ninja import Schema


class FolderOut(Schema):
    id: str
    name: str
    color: str
    parentId: Optional[str]
    order: int
    createdAt: datetime
    updatedAt: datetime

    @staticmethod
    def from_model(folder) -> "FolderOut":
        return FolderOut(
            id=str(folder.uuid),
            name=folder.name,
            color=folder.color,
            parentId=str(folder.parent.uuid) if folder.parent else None,
            order=folder.order,
            createdAt=folder.created_at,
            updatedAt=folder.updated_at,
        )


class FolderCreateIn(Schema):
    name: str
    color: str = ""
    parentId: Optional[str] = None


class FolderUpdateIn(Schema):
    name: Optional[str] = None
    color: Optional[str] = None
