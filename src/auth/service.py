from sqlalchemy.orm import Session
from src.users.models import User
from src.core.security import verify_password, create_access_token, get_password_hash

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(User).filter(User.username == username).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user

def login_user(db: Session, username: str, password: str):
    user = authenticate_user(db, username, password)
    if not user:
        return None
    token = create_access_token({"sub": user.username})
    return token

def register_user(db: Session, username: str, email: str, password: str, role: str = "user"):
    hashed_pw = get_password_hash(password)
    new_user = User(username=username, email=email, hashed_password=hashed_pw, role=role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
