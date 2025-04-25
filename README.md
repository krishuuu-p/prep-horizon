# PrepHorizon
A testing platform

Create 2 separates .env files by copying the contents of .env.example files in both frontend and backend folders

### Database syncing
* Main database file is database_dump.sql
* If you make any changes to database structure or add data and want to create a dump: `mysqldump -u root -p --default-character-set=utf8 --databases prep_horizon > database_dump.sql`
* Whenever you pull, sync the changes to your local database: `mysql -u root -p prep_horizon < database_dump.sql`
* You can also change the encoding scheme by opening the dump in notepad and saving using the UTF-8 encoding.

### Running the website
Running the Full Stack Application
Each part of the application should run in a separate terminal.

🖥️ Terminal 1 (Flask Backend)
1. Navigate to the backend folder:
`cd flask_backend`

2. Create a virtual environment (only once):
`python -m venv venv`

3. Activate the virtual environment:
`venv\Scripts\Activate`

Mac/Linux:
`source venv/bin/activate`

4. Install dependencies:
`pip install -r requirements.txt`

5. Run Flask server:
`python flask_backend.py`

✅ Flask backend running on http://localhost:5001

🖥️ Terminal 2 (Node.js Backend)
1. Navigate to the backend folder:
`cd backend`

2. Install dependencies:
`npm install`

3. Run the Node.js backend:
`node index.js`

✅ Node.js backend running on http://localhost:5000

🖥️ Terminal 3 (Frontend - React)
1. Navigate to the frontend folder:
`cd frontend`

2. Install dependencies:
`npm install`

3. Run the React app:
`npm start`

✅ React app running on http://localhost:3000

# Quiz Generation Progress

## Overview
This project focuses on generating multiple-choice questions (MCQs) using machine learning. It leverages `Gemma 3` for text generation and includes a Flask-based backend to process PDF inputs and generate high-quality questions.

## Current Status
### 1. **Machine Learning-Based MCQ Generation**
- Integrated a model for automatic MCQ generation.
- Using real-time inference for generating high-quality questions.
- Adjusting parameters such as `temperature`, `top_k`, and `top_p` to improve question quality.
- Using `Gemma 3` for text generation.

### 2. **API & Backend Development**
- Developed a Flask-based backend to process PDF inputs and generate MCQs.
- Using Axios for frontend communication.
- Addressing API endpoint issues (`404 NOT FOUND` error when calling `/process-pdf`).

### 3. **System Debugging & Optimization**
- Investigating issues related to model inference settings.
- Working on increasing output length for better MCQ generation.


## Running & Setup
### Setting Up the MCQ Generation System
Set up:
Install ollama 
On terminal run ollama pull gemma3

1. **Install Dependencies:**
   ```sh
   pip install flask torch transformers
   ```
2. **Run the Flask Server:**
   ```sh
   python app.py
   ```
3. **Send a Request to Generate MCQs:**
   ```sh
   curl -X POST "http://127.0.0.1:5001/process-pdf" -F "file=@sample.pdf"
   ```

### Running `Gemma 3`
- Ensure that `Gemma 3` is installed and accessible within the environment.
- Modify inference parameters in the configuration file:
  ```json
  {
      "stop": [
          "<end_of_turn>"
      ],
      "temperature": 1,
      "top_k": 64,
      "top_p": 0.95
  }
  ```
- Adjust parameters as needed to improve output quality.

###
Running InterviewPage.js, running interviewpage.js on  a single laptop can be done by localhost:5000 on two seperate tabs. For running it on two seperate devices. You need to enable certain permissions.
-> chrome://flags/#unsafely-treat-insecure-origin-as-secure
-> Enter your ip adderess https://your-ip-address:3000 and enable it
-> Then use this link on any other devices connected to the same network: https://your-ip-address:3000 

---
*This document will be updated as development progresses.*


