// File: /frontend/src/App.jsx

import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import JobsPage from './pages/JobsPage';
import JobDetailPage from './pages/JobDetailPage';
import AboutPage from './pages/AboutPage'; // Import the new page
import './App.css';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    {children}
  </motion.div>
);

function App() {
  const location = useLocation();

  return (
    <div className="App">
      <header className="App-header">
        <nav className="main-nav">
          <Link to="/" className="logo-link"><h1>ResumeRAG</h1></Link>
          <div className="nav-links">
            <Link to="/" className="nav-link">Q&A</Link>
            <Link to="/jobs" className="nav-link">Job Matcher</Link>
            <Link to="/about" className="nav-link">About</Link> {/* Replaced GitHub with About */}
          </div>
        </nav>
        
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
            <Route path="/results" element={<PageWrapper><ResultsPage /></PageWrapper>} />
            <Route path="/jobs" element={<PageWrapper><JobsPage /></PageWrapper>} />
            <Route path="/jobs/:jobId" element={<PageWrapper><JobDetailPage /></PageWrapper>} />
            <Route path="/about" element={<PageWrapper><AboutPage /></PageWrapper>} /> {/* Added the new route */}
          </Routes>
        </AnimatePresence>

      </header>
    </div>
  );
}

export default App;
