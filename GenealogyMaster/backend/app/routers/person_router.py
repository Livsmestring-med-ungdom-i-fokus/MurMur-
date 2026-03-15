from fastapi import APIRouter

from app.models.person import Person

router = APIRouter()


@router.get("/", response_model=list[Person])
def list_persons() -> list[Person]:
    return []
