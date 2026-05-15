import argparse
import sys

from sqlmodel import Session, select

from src.backend.database import engine
from src.backend.models import Role, User
from src.backend.utils.datetime_utils import utc_now


def promote_user_role(email: str, role_name: str) -> int:
    normalized_email = (email or "").strip().lower()
    normalized_role = (role_name or "").strip().lower()
    if not normalized_email:
        print("Email is required.", file=sys.stderr)
        return 1
    if normalized_role not in {"student", "teacher", "admin"}:
        print("Role must be one of: student, teacher, admin.", file=sys.stderr)
        return 1

    with Session(engine) as session:
        user = session.exec(select(User).where(User.email == normalized_email)).first()
        if not user:
            print(f"User not found: {normalized_email}", file=sys.stderr)
            return 1

        role = session.exec(select(Role).where(Role.name == normalized_role)).first()
        if not role:
            role = Role(name=normalized_role, description=f"{normalized_role} role")
            session.add(role)
            session.flush()

        user.role_id = role.id
        user.updated_at = utc_now()
        session.add(user)
        session.commit()
        session.refresh(user)

        print(f"Updated role: {user.email} -> {normalized_role}")
        return 0


def main() -> None:
    parser = argparse.ArgumentParser(description="Promote or demote an existing user role.")
    parser.add_argument("--email", required=True, help="Existing user email")
    parser.add_argument("--role", default="admin", help="Target role: student|teacher|admin")
    args = parser.parse_args()

    raise SystemExit(promote_user_role(args.email, args.role))


if __name__ == "__main__":
    main()
