import sys
from models.user_model import User
from config.db import db

def make_admin(email):
    user_model = User()
    user = user_model.find_by_email(email)
    
    if not user:
        print(f"User with email '{email}' not found.")
        return
    
    result = user_model.update_user_role(user['_id'], 'admin')
    
    if result.modified_count > 0:
        print(f"Successfully updated user '{email}' to admin.")
    else:
        print(f"User '{email}' is already an admin or update failed.")

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <user_email>")
        sys.exit(1)
        
    email_to_update = sys.argv[1]
    make_admin(email_to_update)
