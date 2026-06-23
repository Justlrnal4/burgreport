from typing import Generic, Literal, TypeVar

from pydantic import BaseModel

DataStatus = Literal["live", "estimated", "reference", "unavailable", "example"]

T = TypeVar("T")


class DataField(BaseModel, Generic[T]):
    value: T | None
    status: DataStatus
    label: str | None = None
    source: str | None = None
    as_of: str | None = None
    note: str | None = None


def live_field(value: T | None, source: str | None = None, note: str | None = None) -> DataField[T]:
    """Real, authoritative observation. Reserved for licensed/first-party feeds —
    a web-search price estimate must NOT use this status (use estimated_field)."""
    if value is None:
        return unavailable_field(note=note)
    return DataField(value=value, status="live", source=source, note=note)


def estimated_field(value: T | None, source: str | None = None, note: str | None = None) -> DataField[T]:
    """An unvalidated estimate parsed from public listings — labeled as such so it
    never reads as an authoritative market figure."""
    if value is None:
        return unavailable_field(note=note)
    return DataField(value=value, status="estimated", source=source, note=note)


def reference_field(value: T | None, source: str = "BurgReport reference dataset", note: str | None = None) -> DataField[T]:
    return DataField(value=value, status="reference", source=source, note=note)


def unavailable_field(label: str | None = None, note: str | None = None) -> DataField[None]:
    return DataField(value=None, status="unavailable", label=label, note=note)
