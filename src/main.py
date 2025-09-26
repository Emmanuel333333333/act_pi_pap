from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.auth.router import router as auth_router
from src.users.router import router as users_router
from src.products.router import router as products_router
from src.reviews.router import router as reviews_router
from src.categories.router import router as categories_router

app = FastAPI(title="API Reseñas")

# ===== Configuración de CORS =====
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Durante desarrollo permite todas las URLs
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos HTTP: GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Permite todos los encabezados
)

# ===== Rutas =====
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(products_router)
app.include_router(reviews_router)
app.include_router(categories_router)