import Head from 'next/head';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Bellyfed</title>
        <meta name="description" content="Bellyfed application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://bellyfed.com">Bellyfed</a>
        </h1>

        <p className={styles.description}>
          Get started by editing{' '}
          <code className={styles.code}>src/pages/index.tsx</code>
        </p>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://bellyfed.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Bellyfed
        </a>
      </footer>
    </div>
  );
}
