// // File: /frontend/src/components/ResumeList.jsx

// import { useState, useEffect } from 'react';
// import styles from './ResumeList.module.css';

// function ResumeList({ uploadMessage }) {
//   const [resumes, setResumes] = useState([]);

//   useEffect(() => {
//     const fetchResumes = async () => {
//       try {
//         const response = await fetch('http://127.0.0.1:8000/api/resumes');
//         const data = await response.json();
//         setResumes(data.items || []); 
//       } catch (error) {
//         console.error("Failed to fetch resumes:", error);
//       }
//     };
//     fetchResumes();
//   }, [uploadMessage]); // Refreshes the list every time a new file is uploaded

//   return (
//     <div className={styles.resumeListCard}>
//       <h3>Loaded Resumes ({resumes.length})</h3>
//       {resumes.length > 0 ? (
//         <ul>
//           {resumes.map((name, index) => <li key={index}>{name}</li>)}
//         </ul>
//       ) : (
//         <p>No resumes uploaded yet. Add a PDF to begin.</p>
//       )}
//     </div>
//   );
// }

// export default ResumeList;