from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from src.core.database import Base

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    rating = Column(Integer, nullable=False)
    comment = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String, nullable=False) 
    product_id = Column(Integer, ForeignKey("products.id"))

    # relaciones
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
