from src.core.database import SessionLocal
from src.users.models import User
from src.products.models import Product
from src.reviews.models import Review
from src.categories.models import Category
from src.core.security import get_password_hash

# Crear la sesión
db = SessionLocal()

# Limpiar tablas (opcional, solo para desarrollo)
db.query(Review).delete()
db.query(User).delete()
db.query(Product).delete()
db.query(Category).delete()
db.commit()

# Insertar categorías
cat1 = Category(name="Bicicletas")
cat2 = Category(name="Accesorios")

db.add_all([cat1, cat2])
db.commit()

# Insertar productos
prod1 = Product(name="Orbea Alma", description="Bicicleta de montaña ligera", category=cat1)
prod2 = Product(name="Orbea Orca", description="Bicicleta de carretera de alto rendimiento", category=cat1)
prod3 = Product(name="Casco Pro", description="Casco ligero de carbono", category=cat2)

db.add_all([prod1, prod2, prod3])
db.commit()

# Insertar usuarios (con contraseña hasheada)
user1 = User(username="Santiago", email="santi@example.com", hashed_password=get_password_hash("santi123"))
user2 = User(username="Emmanuel", email="emmanuel@example.com", hashed_password=get_password_hash("david123"))

db.add_all([user1, user2])
db.commit()

# Insertar reseñas
review1 = Review(rating=5, comment="Excelente bici", user=user1, product=prod1)
review2 = Review(rating=4, comment="Muy buena, pero cara", user=user1, product=prod2)
review3 = Review(rating=3, comment="Buen casco, aunque algo caro", user=user2, product=prod3)

db.add_all([review1, review2, review3])
db.commit()

db.close()
