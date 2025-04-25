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
-Install ollama 
-On terminal run ollama pull gemma3

###
Running InterviewPage.js, running interviewpage.js on  a single laptop can be done by localhost:5000 on two seperate tabs. For running it on two seperate devices. You need to enable certain permissions.
-> chrome://flags/#unsafely-treat-insecure-origin-as-secure
-> Enter your ip adderess https://your-ip-address:3000 and enable it
-> Then use this link on any other devices connected to the same network: https://your-ip-address:3000 

# 📊 Excel File Format Guide

This guide explains how to prepare Excel (`.xlsx`) files for uploading data to the system. These uploads are used for:

- Adding / Editing / Deleting **Students**
- Adding / Editing / Deleting **Teachers**
- Adding?Removing **Students / Teachers to Classes**

> All files must be in **`.xlsx`** format (Excel Workbook)  
> CSV or other formats are **not supported**

---

## 1. Add / Edit / Delete Students / Teachers

### Required Columns

| Column Name | Description               | Example            |
|-------------|---------------------------|--------------------|
| username    | Unique student username   | `john_doe`         |
| name        | Full name of the student  | `John Doe`         |
| email       | Valid email ID            | `john@example.com` |
| password    | Password                  | `pass1234`         |

### Operation-Specific Instructions

- **Add Students**: Fill all columns. The student is added to the system.
- **Edit Students**: Match existing `username`; updated `name` and/or `email` will be applied.
- **Delete Students**: Only `username` is required.

---


## 2. Add Students / Teachers to Class

### Required Columns

| Column Name | Description                 | Example      |
|-------------|-----------------------------|--------------|
| username    | Student/Teacher username    | `john_doe`   |

> We select classes using a dropdown menu on the page.

---

## General Guidelines

- Column headers must match **exactly** as shown (case-sensitive, no extra spaces).
- Always include a **header row** (first row must contain column names).
- Do **not** include blank rows, formulas, merged cells, or styled formatting.
- Keep all data in **one worksheet** (first sheet only will be read).
- If uploading fails, double-check spelling of headers and file format and also check if there are duplicates.

---

## Examples

### Example excel files are added for your reference.
- You can find sample Excel files inside the `/sample_excels/` folder of this repository.

---
*This document will be updated as development progresses.*


