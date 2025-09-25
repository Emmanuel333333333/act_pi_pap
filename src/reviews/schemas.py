from pydantic import BaseModel

class ReviewBase(BaseModel):
    content: str
    rating: int
    comment: str | None = None

class ReviewCreate(ReviewBase):
    user_id: int
    product_id: int

class ReviewRead(ReviewBase):
    id: int
    user_id: int
    product_id: int

    class Config:
        from_attributes = True
