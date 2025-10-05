import { motion } from 'framer-motion';
import { FaSearch, FaFileArchive, FaBrain, FaShieldAlt } from 'react-icons/fa';
import { SiReact, SiPython, SiFastapi, SiVite, SiLangchain } from 'react-icons/si';
import PageHeader from '../components/PageHeader';
import styles from './AboutPage.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
};

function AboutPage() {
  return (
    <>
      <PageHeader 
        title="About ResumeRAG" 
        subtitle="An AI-powered application designed for intelligent resume analysis and talent matching."
      />

      <motion.div 
        className={styles.aboutContainer}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className={styles.aboutCard} variants={itemVariants}>
          <h3>What is ResumeRAG?</h3>
          <p>
            ResumeRAG is a modern web application built for this hackathon. It leverages the power of Retrieval-Augmented Generation (RAG) to provide a seamless interface for querying and analyzing a collection of resumes. Instead of manually sifting through documents, users can ask natural language questions and receive precise, evidence-backed answers.
          </p>
        </motion.div>

        <motion.h3 className={styles.sectionTitle} variants={itemVariants}>Core Features</motion.h3>
        <div className={styles.featureGrid}>
          <motion.div className={styles.featureCard} variants={itemVariants}>
            <FaFileArchive size={30} className={styles.icon} />
            <h4>Multi-File Ingestion</h4>
            <p>Supports uploading multiple PDFs and ZIP archives for bulk processing.</p>
          </motion.div>
          <motion.div className={styles.featureCard} variants={itemVariants}>
            <FaSearch size={30} className={styles.icon} />
            <h4>Semantic Q&A</h4>
            <p>Ask complex questions and get the most relevant text snippets, ranked by relevance.</p>
          </motion.div>
          <motion.div className={styles.featureCard} variants={itemVariants}>
            <FaBrain size={30} className={styles.icon} />
            <h4>AI-Powered Gap Analysis</h4>
            <p>Match resumes against job descriptions to automatically identify matching and missing skills.</p>
          </motion.div>
          {/* NEW FEATURE CARD */}
          <motion.div className={styles.featureCard} variants={itemVariants}>
            <FaShieldAlt size={30} className={styles.icon} />
            <h4>Robust & Secure</h4>
            <p>Includes rate limiting, idempotency, PII redaction, and non-blocking architecture.</p>
          </motion.div>
        </div>

        <motion.h3 className={styles.sectionTitle} variants={itemVariants}>Technology Stack</motion.h3>
        <div className={styles.techGrid}>
          <motion.div className={styles.techItem} variants={itemVariants}><SiReact size={40} /><span>React</span></motion.div>
          <motion.div className={styles.techItem} variants={itemVariants}><SiPython size={40} /><span>Python</span></motion.div>
          <motion.div className={styles.techItem} variants={itemVariants}><SiFastapi size={40} /><span>FastAPI</span></motion.div>
          <motion.div className={styles.techItem} variants={itemVariants}><SiVite size={40} /><span>Vite</span></motion.div>
          {/* NEW TECH ICONS */}
          <motion.div className={styles.techItem} variants={itemVariants}><SiLangchain size={40} /><span>LangChain</span></motion.div>
          <motion.div className={styles.techItem} variants={itemVariants}><FaBrain size={40} /><span>Hugging Face</span></motion.div>
        </div>
      </motion.div>
    </>
  );
}

export default AboutPage;