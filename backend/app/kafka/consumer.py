from confluent_kafka import Consumer, KafkaError
from app.kafka import KAFKA_BROKER, KAFKA_TOPIC, KAFKA_GROUP_ID

final_message = []
def consume_messages():
    # global final_message
    # Configure Kafka consumer
    consumer_config = {
        'bootstrap.servers': KAFKA_BROKER,  # Kafka broker address
        'group.id': KAFKA_GROUP_ID,         # Consumer group ID
        'auto.offset.reset': 'earliest',    # Start reading at the beginning if no offset is found
    }

    consumer = Consumer(consumer_config)
    
    # Subscribe to the topic
    consumer.subscribe([KAFKA_TOPIC])
    print(f"Kafka Consumer started. Listening on topic: {KAFKA_TOPIC}")
    try:
        while True:
            # Poll Kafka for messages
            msg = consumer.poll(timeout=1.0)  # Wait for 1 second for a message
            if msg is None:
                continue  # No message received, continue polling

            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    # End of partition event, can ignore
                    print(f"End of partition reached for {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
                else:
                    # Log other errors
                    print(f"Kafka error: {msg.error()}")
            else:
                # Process the message
                message_value = msg.value().decode('utf-8')  # Decode message value
                if message_value != "":
                    final_message = message_value.splitlines()
                    with open('../filte.txt', 'w') as f:
                        for item in final_message:
                            f.write(f"{item}\n")
                    # print(f"Received message: {final_message}")

                    # /data

                # Optionally, add business logic here (e.g., save to DB, process data)

    except KeyboardInterrupt:
        print("Kafka Consumer shutting down...")
    finally:
        # Gracefully close the consumer
        consumer.close()
