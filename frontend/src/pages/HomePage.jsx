import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import styles from './HomePage.module.css';

function HomePage() {
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadMessage, setUploadMessage] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setUploadMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadMessage('Please select one or more files first.');
      return;
    }
    setUploadMessage(`Uploading ${selectedFiles.length} file(s)...`);
    
    let filesProcessed = 0;
    let errorOccurred = null;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      const singleFileIdempotencyKey = uuidv4();
      try {
        // URL UPDATED FOR PRODUCTION
        const response = await fetch('https://acceptable-eagerness-production-aad4.up.railway.app/api/resumes', { 
          method: 'POST', 
          headers: { 'Idempotency-Key': singleFileIdempotencyKey },
          body: formData 
        });
        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
        filesProcessed++;
      } catch (error) {
        errorOccurred = error.message;
        break; 
      }
    }

    if (errorOccurred) {
      setUploadMessage(`An error occurred: ${errorOccurred}`);
    } else {
      setUploadMessage(`${filesProcessed} file(s) uploaded successfully.`);
    }

    setSelectedFiles(null);
    setFileInputKey(Date.now());
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const handleAskQuestion = async () => {
    if (!query) {
      alert('Please enter a question.');
      return;
    }
    setIsLoading(true);

    try {
      // URL UPDATED FOR PRODUCTION
      const response = await fetch('https://acceptable-eagerness-production-aad4.up.railway.app/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });
      if (!response.ok) throw new Error('Failed to get an answer.');
      const data = await response.json();
      navigate('/results', { state: { results: data.results, query: query } });
    } catch (error) {
      alert(`An error occurred while asking the question.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.hero}>
        <h2>Unlock Insights from Resumes, Instantly.</h2>
        <p>
          ResumeRAG uses AI to help you search, query, and match candidates from a pool of resumes.
        </p>
      </div>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h2>1. Upload Resumes</h2>
          <p>Add one or more PDFs to the knowledge base.</p>
          <input 
            key={fileInputKey}
            type="file" 
            accept=".pdf,.zip" 
            onChange={handleFileChange} 
            multiple 
          />
          <button onClick={handleUpload} disabled={!selectedFiles}>
            Upload and Process
          </button>
          {uploadMessage && <p className={styles.message}>{uploadMessage}</p>}
        </div>

        <div className={styles.card}>
          <h2>2. Ask a Question</h2>
          <p>Query all uploaded resumes with any question.</p>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="e.g., Who has experience with Python?"
              className={styles.queryInput}
            />
            <button onClick={handleAskQuestion} disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomePage;
