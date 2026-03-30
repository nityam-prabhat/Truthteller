from app import create_app
# from app.kafka.consumer import consume_messages
import threading
from waitress import serve

app = create_app()

if __name__ == '__main__':
    # Start Kafka Consumer in a separate thread
    # consumer_thread = threading.Thread(target=consume_messages)
    # consumer_thread.daemon = True  # Daemon thread will exit when the main thread exits
    # consumer_thread.start()
    
    # Run the Flask app
    app.run(debug=True,host='localhost')
    # serve(app, host="0.0.0.0", port=5000)

