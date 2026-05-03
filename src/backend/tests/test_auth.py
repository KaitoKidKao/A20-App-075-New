import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def test_auth():
    print("🚀 Bắt đầu test Authentication...")
    
    # 1. Đăng ký
    print("\n--- Testing Register ---")
    reg_data = {
        "email": "student@a20.edu.vn",
        "password": "password123",
        "full_name": "Nguyen Van A",
        "role": "student"
    }
    try:
        response = requests.post(f"{BASE_URL}/register", json=reg_data)
        print(f"Status: {response.status_code}")
        print(response.json())
    except Exception as e:
        print(f"❌ Lỗi: {e}")

    # 2. Đăng nhập
    print("\n--- Testing Login ---")
    login_data = {
        "username": "student@a20.edu.vn",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/login", data=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            token_data = response.json()
            print("✅ Đăng nhập thành công!")
            print(f"Token: {token_data['access_token'][:30]}...")
            print(f"Role: {token_data['role']}")
        else:
            print(f"❌ Thất bại: {response.text}")
    except Exception as e:
        print(f"❌ Lỗi: {e}")

if __name__ == "__main__":
    test_auth()
