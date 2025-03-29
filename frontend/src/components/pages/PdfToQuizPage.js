import { useState } from 'react';
import axios from "axios"
import Panel from './Panel';
import '../styles/PdfToQuizPage.css';

function PdfToQuizPage() {
    const [activePage, setActivePage] = useState("Tests");
    const [url, setUrl] = useState("");
    const [manualText, setManualText] = useState("");
    const [files, setFiles] = useState(null);
    const [mcqs, setMcqs] = useState([]);
    const [extractedText, setExtractedText] = useState("");
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      // Append file (if any) – using the first file in case of multiple files.
      if (files && files.length > 0) {
        formData.append("file", files[0]);
      }
      // Optionally, you can send these values if you later want to process URL or manual text.
      formData.append("url", url);
      formData.append("manual_text", manualText);
  
      try {
        const response = await axios.post("http://localhost:5000/upload-pdf", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setExtractedText(response.data.text);
        setMcqs(response.data.mcqs);
      } catch (error) {
        console.error("Error generating MCQs:", error);
      }
    };
  
    return (
      <div className="pdf-to-quiz-page">
        <Panel activePage={activePage} setActivePage={setActivePage} />
  
        <div className="pdf-container">
          <h1 className="mb-4">Generate MCQs</h1>
          <p className="lead">
            This application generates multiple-choice questions (MCQs) based on the provided text.
          </p>
  
          <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className="form-group">
              <label htmlFor="url">Provide URL Link (Optional)</label>
              <input
                type="text"
                className="form-control"
                id="url"
                name="url"
                placeholder="Enter a valid URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="manual_text">Manual Input (Optional)</label>
              <textarea
                className="form-control"
                id="manual_text"
                name="manual_text"
                rows="4"
                placeholder="Paste or write a paragraph of text here"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
              ></textarea>
            </div>
  
            <div className="form-group">
              <label htmlFor="file">Upload File(s) (PDF or TXT) (Optional)</label>
              <input
                type="file"
                className="form-control-file"
                id="file"
                name="files[]"
                multiple
                onChange={(e) => setFiles(e.target.files)}
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="num_questions">Number of Questions:</label>
              <select className="form-control" id="num_questions" name="num_questions">
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>
  
            <button type="submit" className="btn btn-secondary">
              Generate MCQs
            </button>
          </form>
  
          {extractedText && (
            <div>
              <h3>Extracted Text:</h3>
              <p>{extractedText}</p>
            </div>
          )}
  
          {mcqs && mcqs.length > 0 && (
            <div>
              <h3>Generated MCQs:</h3>
              <ul>
                {mcqs.map((mcq, index) => (
                  <li key={index}>
                    <strong>{mcq.question}</strong>
                    <ul>
                      {mcq.options.map((option, i) => (
                        <li key={i}>{option}</li>
                      ))}
                    </ul>
                    <em>Answer: {mcq.answer}</em>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  export default PdfToQuizPage;
