# Create this
from pymongo import MongoClient

# Local MongoDB connection
client = MongoClient("mongodb://localhost:27017/")

# Database
db = client["growthpulse_db"]

# Collections
sales_collection = db["sales_data"]
