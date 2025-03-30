from flask import Flask, request, jsonify
import PyPDF2  # For reading PDFs
from bs4 import BeautifulSoup  # For parsing HTML content from URLs
import requests  # For fetching webpage content
import random  # To simulate AI-based MCQ generation
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)  # Allow requests from React/Node.js

def extract_text_from_url(url):
    try:
        response = requests.get(url)
        # Parse the HTML content
        soup = BeautifulSoup(response.text, "html.parser")
        # Get the text with newlines between elements
        text = soup.get_text(separator="\n")
        return text
    except Exception as e:
        return f"Error fetching URL: {str(e)}"

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

def generate_mcqs(text):
    if not text:
        return []
    # Dummy AI-generated MCQs (replace with real ML logic)
    mcqs = [
        {"question": "What is the main topic of the text?", "options": ["Topic A", "Topic B", "Topic C", "Topic D"], "answer": "Topic A"},
        {"question": "What is the second paragraph about?", "options": ["Concept X", "Concept Y", "Concept Z", "None"], "answer": "Concept X"},
    ]
    return mcqs

@app.route("/process-pdf", methods=["POST"])
def process_pdf_route():
    text = ""
    # Case 1: Process a file (PDF or TXT)
    if "file" in request.files and request.files["file"].filename != "":
        file = request.files["file"]
        filename = file.filename
        ext = os.path.splitext(filename)[1].lower()
        if ext == ".pdf":
            temp_path = "uploaded.pdf"
            file.save(temp_path)
            text = extract_text_from_pdf(temp_path)
            os.remove(temp_path)
        elif ext == ".txt":
            text = file.read().decode("utf-8")
        else:
            return jsonify({"error": "Unsupported file type"}), 400
    # Case 2: Process URL input
    elif "url" in request.form and request.form["url"]:
        url = request.form["url"]
        text = extract_text_from_url(url)
    # Case 3: Process manual text input
    elif "manual_text" in request.form and request.form["manual_text"]:
        text = request.form["manual_text"]
    else:
        return jsonify({"error": "No input provided"}), 400

    if text.startswith("Error"):
        return jsonify({"error": text}), 500

    mcqs = generate_mcqs(text)
    return jsonify({"text": text, "mcqs": mcqs})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
