from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from src.core.database import get_db
from src.reviews import models, schemas
from src.products.models import Product  # 👈 Importar el modelo Product

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.post("/", response_model=schemas.ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La calificación debe estar entre 1 y 5."
        )
    
    db_review = models.Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Recargar con user + product + category
    db_review = (
        db.query(models.Review)
        .options(
            joinedload(models.Review.user),
            joinedload(models.Review.product).joinedload(Product.category)  # 👈 cambio aquí
        )
        .filter(models.Review.id == db_review.id)
        .first()
    )

    return db_review


@router.get("/", response_model=list[schemas.ReviewRead])
def list_reviews(db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .options(
            joinedload(models.Review.user),
            joinedload(models.Review.product).joinedload(Product.category)  # 👈 cambio aquí
        )
        .all()
    )

    if not reviews:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron reseñas registradas."
        )

    return reviews
