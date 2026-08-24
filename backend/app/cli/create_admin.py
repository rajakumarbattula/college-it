"""Create the first administrator without exposing a password in shell history."""

import argparse
from getpass import getpass

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.user import User, UserRole
from app.repositories.user import UserRepository


def main() -> None:
    """Prompt for and create an administrator account."""
    parser = argparse.ArgumentParser(description="Create a College IT administrator account.")
    parser.add_argument("--email", required=True, type=str.lower)
    arguments = parser.parse_args()

    password = getpass("Password: ")
    password_confirmation = getpass("Confirm password: ")
    if len(password) < 12:
        parser.error("Password must be at least 12 characters long.")
    if password != password_confirmation:
        parser.error("Passwords do not match.")

    session = SessionLocal()
    try:
        repository = UserRepository()
        if repository.get_by_email(session, arguments.email) is not None:
            parser.error("A user with this email already exists.")
        session.add(
            User(
                email=arguments.email,
                password_hash=hash_password(password),
                role=UserRole.ADMIN,
            )
        )
        session.commit()
    finally:
        session.close()


if __name__ == "__main__":
    main()
