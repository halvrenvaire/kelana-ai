#!/usr/bin/env python3
"""
Script untuk membuat semua tabel di database.
Jalankan: python migrate.py
"""

from database import init_db
from models.user import User
from models.trip import Trip
from models.conversation import Conversation, Message

def main():
    print("🚀 Starting database migration...")
    print("📊 Creating tables if they don't exist...")
    
    try:
        init_db()
        print("✅ Migration completed successfully!")
        print("📋 Tables created/verified:")
        print("   - users")
        print("   - trips")
        print("   - conversations")
        print("   - messages")
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        raise

if __name__ == "__main__":
    main()
