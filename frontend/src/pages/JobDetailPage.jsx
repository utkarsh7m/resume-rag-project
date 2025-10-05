import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styles from './ResultsPage.module.css'; // Reusing styles
import PageHeader from '../components/PageHeader';

function JobDetailPage() {
  const { jobId } = useParams();
  const [jobDescription, setJobDescription] = useState('');
  const [matchResults, setMatchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  const [error, setError] = useState(null);
  
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchJob = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found');
          }
          throw new Error(`Failed to fetch job: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setJobDescription(data.description);
      } catch (error) {
        console.error("Failed to fetch job description:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleMatch = async () => {
    setIsMatching(true);
    setMatchResults([]);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/jobs/${jobId}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ top_n: 3 }),
      });
      if (!response.ok) throw new Error('Match failed.');
      const data = await response.json();
      setMatchResults(data.results);
    } catch (error) {
      console.error(error);
      alert('An error occurred during matching.');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <>
      <PageHeader title={`Gap Analysis for Job #${jobId}`} />

      <div className={styles.card}>
        <Link to="/jobs" className={styles.backLink}>← Back to Jobs List</Link>
        <h2>Job Description</h2>
        {isLoading ? (
          <div className={styles.loader}></div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : (
          <>
            <blockquote style={{ whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto' }}>{jobDescription}</blockquote>
            <button onClick={handleMatch} disabled={isMatching} style={{ width: '100%', marginTop: '1rem', marginLeft: '0' }}>
              {isMatching ? 'Analyzing...' : 'Find Top 3 Matches'}
            </button>
          </>
        )}
      </div>

      {isMatching && <div className={styles.loader} style={{margin: '3rem auto'}}></div>}

      {matchResults.length > 0 && (
        <div className={styles.resultsCard}>
          <h3>Analysis Results</h3>
          {matchResults.map((item, index) => (
            <div key={index} className={styles.snippet}>
              <div className={styles.candidateHeader}>
                <h4>#{index + 1}: {item.candidate}</h4>
                <div className={styles.primaryScore}>{item.match_percentage}% Match</div>
              </div>
              <div className={styles.secondaryScore}>Overall Relevance: {item.relevance_score}</div>
              
              <div className={styles.gapAnalysisContainer}>
                <div className={styles.matchingSkills}>
                  <h5>✅ Matching Skills ({item.matching_skills.length})</h5>
                  <ul>{item.matching_skills.length > 0 ? item.matching_skills.map(skill => <li key={skill}>{skill}</li>) : <li>None found</li>}</ul>
                </div>
                <div className={styles.missingSkills}>
                  <h5>❌ Missing Skills ({item.missing_skills.length})</h5>
                  <ul>{item.missing_skills.length > 0 ? item.missing_skills.map(skill => <li key={skill}>{skill}</li>) : <li>None found</li>}</ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default JobDetailPage;