import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './HomePage.module.css'; // Reusing styles
import PageHeader from '../components/PageHeader';

function JobsPage() {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateJob = async () => {
    if (!jobDescription) {
      alert('Please paste a job description.');
      return;
    }
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: jobDescription }),
      });
      if (!response.ok) throw new Error('Failed to create job.');
      const data = await response.json();
      
      navigate(`/jobs/${data.job_id}`);

    } catch (error) {
      setMessage('An error occurred while creating the job.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Job Matcher" subtitle="Create a new job posting to analyze it against your resumes." />

      <Link to="/" style={{alignSelf: 'flex-start', marginBottom: '1rem', display: 'inline-block'}} className="nav-link">← Back to Q&A</Link>
      
      <div className={styles.card}>
        <h2>New Job Posting</h2>
        <p>Paste a job description below to analyze it against the resumes in the knowledge base.</p>
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
          rows="15"
          className={styles.queryInput}
          style={{ width: '100%', resize: 'vertical' }}
        />
        <button onClick={handleCreateJob} disabled={isLoading} style={{ width: '100%', marginTop: '1rem', marginLeft: '0' }}>
          {isLoading ? 'Creating...' : 'Create Job & Analyze'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </div>
    </>
  );
}

export default JobsPage;