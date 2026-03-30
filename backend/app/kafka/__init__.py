# app/kafka/__init__.py

# Import Kafka consumer logic to make it easily accessible

# Optionally define reusable Kafka configurations
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

# Shared Kafka configurations
KAFKA_BROKER = os.getenv('KAFKA_BROKER', 'localhost:9092')
KAFKA_TOPIC = os.getenv('KAFKA_TOPIC', 'test-topic')
KAFKA_GROUP_ID = os.getenv('KAFKA_GROUP_ID', 'flask-backend')
