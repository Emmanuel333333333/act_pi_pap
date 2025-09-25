from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.core.database import get_db
from src.models.reviews import Review
from src.schemas.reviews import ReviewCreate, ReviewRead

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=ReviewRead)
def create_review(review: ReviewCreate, db: Session = Depends(get_db)):
    new_review = Review(**review.dict())
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@router.get("/", response_model=list[ReviewRead])
def list_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()
