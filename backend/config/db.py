from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        try:
            self.client = MongoClient(os.getenv('MONGODB_URI', 'mongodb://localhost:27017/'))
            self.db = self.client[os.getenv('DB_NAME', 'intelli_tutor')]
            print("Connected to MongoDB successfully!")
        except Exception as e:
            print(f"MongoDB connection error: {e}")
    
    def get_collection(self, collection_name):
        return self.db[collection_name]
    
    def close(self):
        if self.client:
            self.client.close()

# Create database instance
db = Database()
