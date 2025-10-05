import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Highlighter from 'react-highlight-words';
import styles from './ResultsPage.module.css';
import PageHeader from '../components/PageHeader';

function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];
  const query = location.state?.query || '';

  // Handle quoted phrases and individual words
  const searchKeywords = query.match(/\w+|"[^"]+"/g)?.map(word => 
    word.startsWith('"') && word.endsWith('"') 
      ? word.slice(1, -1) 
      : word
  ) || [];

  // If there's no query, redirect to home
  useEffect(() => {
    if (!query) {
      navigate('/');
    }
  }, [query, navigate]);

  return (
    <>
      <PageHeader title="Query Results" subtitle={`Found ${results.length} relevant snippets for "${query}"`} />

      <div className={styles.resultsCard}>
        <Link to="/" className={styles.backLink}>← Ask Another Question</Link>
        
        {results.length > 0 ? (
          results.map((item, index) => (
            <div key={index} className={styles.snippet}>
              <div className={styles.snippetHeader}>
                <h4>Rank #{index + 1} <span className={styles.score}>(Relevance Score: {item.score.toFixed(4)})</span></h4>
                <cite>Source: {item.source}</cite>
              </div>
              <pre className={styles.snippetContent}>
                <Highlighter
                  highlightClassName={styles.highlight}
                  searchWords={searchKeywords}
                  autoEscape={true}
                  textToHighlight={item.snippet}
                />
              </pre>
            </div>
          ))
        ) : (
          <p>No results found for this query.</p>
        )}

        <div className={styles.infoBox}>
          ℹ️ For your privacy, sensitive information like names, emails, and phone numbers has been automatically redacted from the snippets above.
        </div>
      </div>
    </>
  );
}

export default ResultsPage;