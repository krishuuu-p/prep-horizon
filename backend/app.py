
from flask import Flask, render_template, request, send_file, session, url_for, redirect
from flask_bootstrap import Bootstrap
import spacy
import random
from collections import Counter
from PyPDF2 import PdfReader
import requests
from bs4 import BeautifulSoup
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# ---------------------------
# Functions for File and URL Processing and PDF Generation
# ---------------------------
def process_pdf(file):
    text = ""
    pdf_reader = PdfReader(file)
    for page_num in range(len(pdf_reader.pages)):
        page_text = pdf_reader.pages[page_num].extract_text()
        text += page_text
    return text

def process_url(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        # Remove unwanted elements
        for script in soup(['script', 'style', 'header', 'footer', 'nav']):
            script.decompose()
        return soup.get_text(separator='\n')
    except Exception as e:
        print(f"Error processing URL: {e}")
        return ""

def draw_multiline_text(pdf, text, x, y, max_width):
    """Draw text on the PDF canvas, wrapping it if it exceeds max_width."""
    lines = []
    words = text.split(" ")
    current_line = ""
    for word in words:
        test_line = f"{current_line} {word}".strip()
        if pdf.stringWidth(test_line, "Helvetica", 12) <= max_width:
            current_line = test_line
        else:
            lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    for line in lines:
        pdf.drawString(x, y, line)
        y -= 14  # Move down for the next line
    return y

# ---------------------------
# Flask Routes
# ---------------------------
@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        text = ""
        # Check if URL is provided
        if 'url' in request.form and request.form['url']:
            url = request.form['url']
            text = process_url(url)
        # Check if manual text is provided
        elif 'manual_text' in request.form and request.form['manual_text']:
            text = request.form['manual_text']
        # Check if files were uploaded
        elif 'files[]' in request.files:
            files = request.files.getlist('files[]')
            for file in files:
                if file.filename.endswith('.pdf'):
                    text += process_pdf(file)
                elif file.filename.endswith('.txt'):
                    text += file.read().decode('utf-8')
                    
        num_questions = int(request.form['num_questions'])
    return render_template('index.html')

@app.route('/result')
def result():
    mcqs = session.get('mcqs', [])
    return render_template('result.html', mcqs=mcqs)

@app.route('/download_pdf')
def download_pdf():
    mcqs = session.get('mcqs', [])
    if not mcqs:
        return "No MCQs to download.", 400  # Handle no MCQs case

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    pdf.setFont("Helvetica", 12)

    y_position = height - 40
    margin = 30
    max_width = width - 2 * margin

    for index, mcq in mcqs:
        question, choices, correct_answer = mcq
        y_position = draw_multiline_text(pdf, f"Q{index}: {question}?", margin, y_position, max_width)
        options = ['A', 'B', 'C', 'D']
        for i, choice in enumerate(choices):
            y_position = draw_multiline_text(pdf, f"{options[i]}: {choice}", margin + 20, y_position, max_width)
        pdf.drawString(margin + 20, y_position, f"Correct Answer: {correct_answer}")
        y_position -= 20
        if y_position < 50:
            pdf.showPage()
            pdf.setFont("Helvetica", 12)
            y_position = height - 40

    pdf.save()
    buffer.seek(0)
    return send_file(buffer, as_attachment=True, download_name='mcqs.pdf', mimetype='application/pdf')

if __name__ == '__main__':
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=True)

 