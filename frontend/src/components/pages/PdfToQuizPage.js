import { useState } from 'react';
import axios from "axios";
import Panel from './Panel';
import '../styles/PdfToQuizPage.css';

function PdfToQuizPage() {
  const [activePage, setActivePage] = useState("PDF to Quiz");
  const [url, setUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [files, setFiles] = useState(null);
  const [quiz, setQuiz] = useState(""); // Quiz output is a single string
  const [loading, setLoading] = useState(false);
  const [numQuestions, setNumQuestions] = useState("5"); // Default number of questions

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start the loading UI

    const formData = new FormData();
    if (files && files.length > 0) {
      formData.append("file", files[0]);
    }
    formData.append("url", url);
    formData.append("manual_text", manualText);
    formData.append("num_questions", numQuestions);

    try {
      // Ensure the endpoint URL matches your Flask server settings.
      const response = await axios.post(`${process.env.REACT_APP_FLASK_URL}/process-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setQuiz(response.data.quiz);
    } catch (error) {
      console.error("Error generating quiz:", error);
    } finally {
      setLoading(false);
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
            <select
              className="form-control"
              id="num_questions"
              name="num_questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(e.target.value)}
            >
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

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Generating MCQs, please wait...</p>
          </div>
        )}

        {quiz && !loading && (
          <div className="quiz-container">
            <h3>Generated MCQs:</h3>
            <pre>{quiz}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default PdfToQuizPage;
