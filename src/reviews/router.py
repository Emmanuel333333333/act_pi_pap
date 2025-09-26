from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from src.core.database import get_db
from src.reviews import models, schemas

router = APIRouter(prefix="/reviews", tags=["Reviews"])

# Crear una reseña
@router.post("/", response_model=schemas.ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db)):
     # Validar que la calificación esté entre 1 y 5
    if review.rating < 1 or review.rating > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La calificación debe estar entre 1 y 5."
        )
    
    db_review = models.Review(**review.dict())
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review


# Listar todas las reseñas con información de usuario y producto
@router.get("/", response_model=list[schemas.ReviewRead])
def list_reviews(db: Session = Depends(get_db)):
    reviews = (
        db.query(models.Review)
        .options(
            joinedload(models.Review.user),      # Carga la información del usuario
            joinedload(models.Review.product)    # Carga la información del producto
        )
        .all()
    )

    if not reviews:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron reseñas registradas."
        )

    return reviews
