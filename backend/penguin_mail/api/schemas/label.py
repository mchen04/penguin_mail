from typing import Optional

from ninja import Schema


class LabelOut(Schema):
    id: str
    name: str
    color: str

    @staticmethod
    def from_model(label) -> "LabelOut":
        return LabelOut(
            id=str(label.uuid),
            name=label.name,
            color=label.color,
        )


class LabelCreateIn(Schema):
    name: str
    color: str = ""


class LabelUpdateIn(Schema):
    name: Optional[str] = None
    color: Optional[str] = None
