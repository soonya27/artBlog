import { useEffect, useState } from 'react'
import Header from '../components/common/Header'
import { defaultSiteSettings, fetchSiteSettings } from '../lib/siteSettings'
import styles from './About.module.css'

export default function About() {
  const [settings, setSettings] = useState(defaultSiteSettings)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings()
      setSettings(data)
      setLoading(false)
    }

    loadSettings()
  }, [])

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>About</p>
          <h1 className={styles.title}>{settings.artist_name}</h1>
          <p className={styles.subtitle}>{settings.about_title}</p>
        </section>

        <section className={styles.contentSection}>
          {loading ? (
            <div className={styles.loading}>불러오는 중...</div>
          ) : (
            <div
              className={styles.content}
              dangerouslySetInnerHTML={{ __html: settings.about_content }}
            />
          )}
        </section>
      </main>
    </div>
  )
}
