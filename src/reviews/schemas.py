from pydantic import BaseModel

class CategorySimple(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class UserSimple(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True


class ProductSimple(BaseModel):
    id: int
    name: str
    category: CategorySimple | None = None   # 👈 incluimos la categoría

    class Config:
        from_attributes = True


class ReviewBase(BaseModel):
    comment: str | None = None
    rating: int


class ReviewCreate(ReviewBase):
    user_id: int
    product_id: int


class ReviewRead(ReviewBase):
    id: int
    user_id: int
    product_id: int
    user: UserSimple | None = None
    product: ProductSimple | None = None

    class Config:
        from_attributes = True
