from fastapi import FastAPI
from src.auth.router import router as auth_router
from src.users.router import router as users_router
from src.products.router import router as products_router
from src.reviews.router import router as reviews_router
from src.categories.router import router as categories_router

app = FastAPI(title="API Reseñas")

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(reviews_router)
app.include_router(categories_router)