import time
from confluent_kafka import Producer
import asyncio 
# Kafka configuration
KAFKA_BROKER = 'localhost:9092'  # Local Kafka broker
TOPIC = 'test-topic'  # Kafka topic

# Create Kafka Producer instance
producer = Producer({'bootstrap.servers': KAFKA_BROKER})

def delivery_report(err, msg):
    """Callback function to report delivery results"""
    if err is not None:
        print(f"Message delivery failed: {err}")
    else:
        print(f"Message delivered to {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")

async def read_and_send_data(file_path):
    """Read new lines from a file and send to Kafka"""
    try:
        with open(file_path, 'r') as file:
            file_content = file.read()  # Read all lines in the file
            producer.produce(TOPIC, value=file_content.strip(), callback=delivery_report)
            await asyncio.sleep(2)
            # print(f"Sent message: {file_content.strip()}")
        print("Waiting for new lines...")
    except FileNotFoundError:
        print(f"Error: The file {file_path} was not found.")
        return
    with open("input.txt",'w'):
        pass
    await asyncio.sleep(2)

async def start():
    while True:
        await read_and_send_data('input.txt')
        # await asyncio.to_thread(read_and_send_data,'input.txt')
        await asyncio.sleep(2)
        
    
if __name__ == '__main__':
    asyncio.run(start())
