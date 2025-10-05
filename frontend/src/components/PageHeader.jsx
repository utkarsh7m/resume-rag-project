// File: /frontend/src/components/PageHeader.jsx

import styles from './PageHeader.module.css';

function PageHeader({ title, subtitle }) {
  return (
    <div className={styles.pageHeader}>
      <h2>{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}

export default PageHeader;