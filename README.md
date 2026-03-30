# TruthTeller

## Project Overview
TruthTeller is a real-time data processing and fact-checking platform that streams content, evaluates its authenticity using NLP models, and displays the results on an interactive web frontend. This system leverages Apache Kafka for real-time data streaming, integrates various components for data processing, and ensures seamless user interaction.

## Pre-requisites
To set up and run the project, ensure the following tools are installed on your local machine:

- Node.js
- Npm
- Python (version 3.8 or higher recommended)
- Pip
- Apache Kafka
- Conda (optional, for managing Python environments)

## Project Setup
Follow these steps to set up the project:

1. Clone the repository:

   ```bash
   git lfs fetch --all
   git lfs pull
   git lfs clone https://github.com/nityam-prabhat/TruthTeller/

   cd TruthTeller

   ```

2. Configure and run the Apache Kafka server:

   Refer to the official [Kafka setup guide](https://kafka.apache.org/quickstart) for configuration instructions.


3. Install dependencies:

   - Navigate to the `frontend` directory and run:

     ```bash
     npm install

     ```
   - Navigate to the `backend` directory and run:

     ```bash
     pip install -r requirements.txt

     ```
   - Navigate to the `kafkaproducer` directory and run:

     ```bash
     pip install -r requirements.txt

     ```
   - Navigate to the `model` directory and run:

     ```bash
     pip install -r requirements.txt

     ```

## Running the Project
To run the project, open four separate terminals and execute the following commands in their respective directories:

- **Backend**:

  ```bash
  python run.py

  ```
- **Kafka Producer**:

  ```bash
  python kafka_producer.py

  ```
- **Model**:

  ```bash
  python TestBERTModel.py

  ```
- **Frontend**:

  ```bash
  npm run dev

  ```

## User Input Methods
There are two ways to provide input for processing:

1. **Input Text File**:

   - Write the content of any news article into the `/kafkaproducer/input.txt` file and save it.


2. **URL Input**:

   - Open the frontend in your browser, input the URL of an article, and click the `Import URL` button.


## Viewing Results
Users can view the input text and the processed output on the web frontend displayed in the browser.


## Contribution
Contributions are welcome! Please follow the standard Git workflow:

- Fork the repository.

- Create a feature branch.

- Make your changes and submit a pull request.


## License
This project is licensed under the MIT License. See the LICENSE file for details.


## Contact
For any queries or support, please reach out to the repository maintainer through GitHub issues.

