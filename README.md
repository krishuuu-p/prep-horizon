# desiAssessment
A testing platform
Running the Full Stack Application
Each part of the application should run in a separate terminal.

🖥️ Terminal 1 (Flask Backend)
1. Navigate to the backend folder
   
cd flask_backend
2. Create a virtual environment (only once)

python -m venv venv
3. Activate the virtual environment:
venv\Scripts\Activate
Mac/Linux
source venv/bin/activate

4. Install dependencies
pip install -r requirements.txt

5. Run Flask server
python flask_backend.py
✅ Flask backend running on http://localhost:5001

🖥️ Terminal 2 (Node.js Backend)
1. Navigate to the backend folder
cd backend

2. Install dependencies
npm install
Run the Node.js backend
node index.js
✅ Node.js backend running on http://localhost:5000

🖥️ Terminal 3 (Frontend - React)
1. Navigate to the frontend folder
cd frontend

2. Install dependencies
npm install

3. Run the React app
npm start

✅ React app running on http://localhost:3000
