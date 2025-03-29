from flask import Flask, request, jsonify
import PyPDF2  # For reading PDFs
from bs4 import BeautifulSoup  # For parsing text (if needed)
import random  # To simulate AI-based MCQ generation
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow requests from React/Node.js

# Function to extract text from a PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with open(pdf_path, "rb") as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        return f"Error reading PDF: {str(e)}"
    return text

# Function to simulate AI-based MCQ generation
def generate_mcqs(text):
    if not text:
        return []

    # Dummy AI-generated MCQs (replace this with real ML logic)
    mcqs = [
        {"question": "What is the main topic of the text?", "options": ["Topic A", "Topic B", "Topic C", "Topic D"], "answer": "Topic A"},
        {"question": "What is the second paragraph about?", "options": ["Concept X", "Concept Y", "Concept Z", "None"], "answer": "Concept X"},
    ]
    return mcqs

# API to process PDF & generate MCQs
@app.route("/process-pdf", methods=["POST"])
def process_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    pdf_file = request.files["file"]
    pdf_path = "uploaded.pdf"  # Save the uploaded PDF temporarily
    pdf_file.save(pdf_path)

    # Extract text
    extracted_text = extract_text_from_pdf(pdf_path)
    # Remove the temporary file
    os.remove(pdf_path)

    if "Error" in extracted_text:
        return jsonify({"error": extracted_text}), 500

    # Generate MCQs using AI
    mcqs = generate_mcqs(extracted_text)

    return jsonify({"text": extracted_text, "mcqs": mcqs})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
