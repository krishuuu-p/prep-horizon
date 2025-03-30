from flask import Flask, request, jsonify
import PyPDF2  # For reading PDFs
import requests  # For fetching webpage content
from bs4 import BeautifulSoup  # For parsing HTML content from URLs
from flask_cors import CORS
import os
import subprocess  # To call the local command-line tool

app = Flask(__name__)
CORS(app)

def extract_text_from_url(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, "html.parser")
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
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        return f"Error reading PDF: {str(e)}"
    return text.strip()

def generate_questions(text, num_questions):
    if not text:
        return "No text provided for question generation."
    
    prompt = (
        "Content:\n" + text + "\n\n" +
        f"Generate a list of exactly {num_questions} high-quality multiple-choice questions based on the \
            following content along with their options. " +
        "Do not include answers or any other type of questions other than MCQ and do not print anything \
                else other than questions and their answers . Ensure each question is clear and concise\n\n"
    )
    
    try:
        result = subprocess.run(
            [
                "ollama", "run", "gemma3",
            ],
            input=prompt,
            capture_output=True,
            text=True,
            encoding="utf-8",  # Force UTF-8 decoding
            check=True
        )
        output = result.stdout.strip()
        if not output:
            return "No output received from Gemma3."
        return output
    except subprocess.CalledProcessError as e:
        return f"Error generating questions: {e.stderr}"

@app.route("/process-pdf", methods=["POST"])
def process_pdf_route():
    text = ""
    # Case 1: Process file upload (PDF or TXT)
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

    # Retrieve the desired number of questions from the form; default to "5"
    num_questions = request.form.get("num_questions", "5")
    print("Received num_questions:", num_questions)  # Debug logging

    quiz_output = generate_questions(text, num_questions)
    return jsonify({"quiz": quiz_output})

if __name__ == "__main__":
    app.run(port=5001, debug=True)
