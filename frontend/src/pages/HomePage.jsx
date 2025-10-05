import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from '../config';
import styles from './HomePage.module.css';

function HomePage() {
  const navigate = useNavigate();

  // State management for files and UI
  const [selectedFiles, setSelectedFiles] = useState(null); 
  const [uploadMessage, setUploadMessage] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [backendError, setBackendError] = useState(false);
  const fileInputRef = useRef(null);

  // CHANGED: Now handles a list of files, not just one
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setUploadMessage('');
  };

  // Check backend server status
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/`);
        if (!response.ok) {
          setBackendError(true);
          setUploadMessage('Backend server is not responding properly. Please ensure it is running.');
        } else {
          setBackendError(false);
        }
      } catch (error) {
        setBackendError(true);
        setUploadMessage('Cannot connect to backend server. Please ensure it is running.');
      }
    };
    checkServer();
  }, []);

  // Handle multiple files upload with proper state management
  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      setUploadMessage('Please select one or more files first.');
      return;
    }

    if (backendError) {
      setUploadMessage('Cannot upload files: Backend server is not available.');
      return;
    }

    setIsUploading(true);
    setUploadMessage(`Uploading ${selectedFiles.length} file(s)...`);
    
    let filesProcessed = 0;
    let errorOccurred = null;

    for (const file of selectedFiles) {
      const formData = new FormData();
      formData.append('file', file);
      const singleFileIdempotencyKey = uuidv4();
      
      try {
        const response = await fetch(`${API_BASE_URL}/api/resumes`, { 
          method: 'POST', 
          headers: {
            'Idempotency-Key': singleFileIdempotencyKey,
            // Don't set Content-Type header for FormData, browser will set it with boundary
          },
          body: formData 
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          if (response.status === 404) {
            throw new Error('Backend server not found. Please ensure it is running.');
          } else if (response.status === 413) {
            throw new Error('File is too large to upload.');
          } else if (response.status === 429) {
            throw new Error('Too many upload requests. Please wait a moment and try again.');
          }
          throw new Error(errorData.error || `Upload failed for ${file.name}: ${response.status} ${response.statusText}`);
        }

        filesProcessed++;
        setUploadMessage(`Processed ${filesProcessed} of ${selectedFiles.length} files...`);
      } catch (error) {
        if (error.message === 'Failed to fetch') {
          errorOccurred = 'Cannot connect to backend server. Please ensure it is running.';
        } else {
          errorOccurred = error.message;
        }
        break; 
      }
    }

    if (errorOccurred) {
      setUploadMessage(`An error occurred: ${errorOccurred}`);
    } else {
      setUploadMessage(`${filesProcessed} file(s) uploaded successfully.`);
    }

    setSelectedFiles(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
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
      const response = await fetch(`${API_BASE_URL}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query }),
      });
      if (!response.ok) throw new Error(`Failed to get an answer: ${response.status} ${response.statusText}`);
      const data = await response.json();
      navigate('/results', { state: { results: data.results, query: query } });
    } catch (error) {
      alert(`An error occurred while asking the question: ${error.message}`);
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
          {/* CHANGED: Added 'multiple' to the input */}
          <input 
            type="file" 
            accept=".pdf,.zip" 
            onChange={handleFileChange} 
            ref={fileInputRef}
            multiple 
          />
          <button 
            onClick={handleUpload} 
            disabled={!selectedFiles || isUploading || backendError}
            className={backendError ? styles.errorButton : ''}
          >
            {isUploading ? 'Uploading...' : 'Upload and Process'}
          </button>
          {uploadMessage && (
            <p className={`${styles.message} ${backendError ? styles.error : ''}`}>
              {uploadMessage}
            </p>
          )}
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