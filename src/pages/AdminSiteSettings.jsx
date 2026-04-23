import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/common/Header";
import RichEditor from "../components/admin/RichEditor";
import { defaultSiteSettings, fetchSiteSettings, saveSiteSettings } from "../lib/siteSettings";
import styles from "./AdminSiteSettings.module.css";

export default function AdminSiteSettings() {
  const [form, setForm] = useState(defaultSiteSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      const data = await fetchSiteSettings();
      setForm(data);
      setLoading(false);
    };

    loadSettings();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const { error: submitError } = await saveSiteSettings({
      artist_name: form.artist_name.trim(),
      about_title: form.about_title.trim(),
      about_content: form.about_content,
      contact_email: form.contact_email.trim(),
      contact_intro: form.contact_intro.trim(),
    });

    if (submitError) {
      setError("설정 저장 중 오류가 발생했습니다. Supabase 스키마가 최신인지 확인해주세요.");
    } else {
      setSuccess("사이트 설정이 저장되었습니다.");
    }

    setSaving(false);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.eyebrow}>admin · settings</div>
            <h1 className={styles.title}>사이트 설정</h1>
          </div>
          <Link to="/admin" className={styles.backBtn}>
            ← 대시보드
          </Link>
        </div>

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>About 페이지</h2>
                <p className={styles.sectionText}>소개 페이지에 보여줄 이름과 문구를 관리합니다.</p>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>작가 이름</span>
                <input
                  className="input-base"
                  name="artist_name"
                  value={form.artist_name}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </label>

              <label className={styles.field}>
                <span className={styles.label}>소개 한 줄</span>
                <input
                  className="input-base"
                  name="about_title"
                  value={form.about_title}
                  onChange={handleChange}
                  placeholder="작업을 설명하는 짧은 문장"
                />
              </label>

              <div className={styles.field}>
                <span className={styles.label}>소개 본문</span>
                <RichEditor
                  content={form.about_content}
                  onChange={(value) => setForm((current) => ({ ...current, about_content: value }))}
                />
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Contact 페이지</h2>
                <p className={styles.sectionText}>문의 받을 이메일과 안내 문구를 설정합니다.</p>
              </div>

              <label className={styles.field}>
                <span className={styles.label}>문의 수신 이메일</span>
                <input
                  className="input-base"
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="hello@example.com"
                />
              </label>

              <div className={styles.notice}>
                EmailJS 템플릿의 `To Email` 필드에 `{"{{contact_email}}"}`를 넣어두면, 여기서 저장한 주소로 실제 메일이 발송됩니다.
              </div>

              <label className={styles.field}>
                <span className={styles.label}>문의 안내 문구</span>
                <textarea
                  className={`input-base ${styles.textarea}`}
                  name="contact_intro"
                  value={form.contact_intro}
                  onChange={handleChange}
                  placeholder="문의 페이지 상단 설명"
                />
              </label>
            </section>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}

            <div className={styles.actions}>
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? "저장 중..." : "설정 저장"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
