from pydantic import BaseModel


class Person(BaseModel):
    id: str
    first_name: str
    last_name: str
    birth_year: int | None = None
