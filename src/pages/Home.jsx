import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Header from '../components/common/Header'
import PostCard from '../components/public/PostCard'
import styles from './Home.module.css'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getExcerpt(content) {
  if (!content) return '새로운 작업 노트가 곧 여기에 기록됩니다.'
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (!plainText) return '이미지와 함께 작업 과정을 정리한 기록입니다.'
  return plainText.length > 120 ? `${plainText.slice(0, 120)}...` : plainText
}

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPosts() }, [])

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select('id, title, image_url, created_at, content')
      .order('created_at', { ascending: false })

    if (!error && data) {
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const { count } = await supabase
            .from('comments')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', post.id)
            .eq('is_deleted', false)
          return {
            ...post,
            comment_count: count ?? 0,
            excerpt: getExcerpt(post.content),
          }
        })
      )
      setPosts(postsWithCounts)
    }
    setLoading(false)
  }

  const featuredPost = posts[0] ?? null
  const recentPosts = featuredPost ? posts.slice(1, 5) : []
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0)

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : posts.length === 0 ? (
          <section className={styles.emptyState}>
            <div className={styles.hero}>
              <p className={styles.eyebrow}>Artblog Archive</p>
              <h1 className={styles.heroTitle}>그림과 메모가 쌓이는 개인 아카이브</h1>
              <p className={styles.heroSub}>
                첫 번째 작품을 올리면 이 공간이 작가 노트와 이미지 중심의 포트폴리오 홈으로 완성됩니다.
              </p>
            </div>
            <div className={styles.empty}>아직 게시물이 없습니다</div>
          </section>
        ) : (
          <>
            <section className={styles.heroSection}>
            <div className={styles.heroCopy}>
                <p className={styles.eyebrow}>Artworks</p>
                <h1 className={styles.heroTitle}>작업 이미지와 기록을 한눈에 보는 아카이브</h1>
                <p className={styles.heroSub}>
                  완성작, 드로잉, 작업 노트까지 한 흐름 안에서 살펴볼 수 있도록 최근 작업과 전체 게시물을 정리했습니다.
                </p>
              </div>
              <div className={styles.heroMeta}>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>게시물</span>
                  <strong className={styles.metaValue}>{posts.length}</strong>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>댓글</span>
                  <strong className={styles.metaValue}>{totalComments}</strong>
                </div>
                <div className={styles.metaCard}>
                  <span className={styles.metaLabel}>최근 업데이트</span>
                  <strong className={styles.metaValueSmall}>{formatDate(featuredPost.created_at)}</strong>
                </div>
              </div>
            </section>

            <section className={styles.featuredSection}>
              <div className={styles.sectionHeader}>
                <div>
                  <p className={styles.sectionEyebrow}>Featured Work</p>
                  <h2 className={styles.sectionTitle}>가장 최근에 올린 작업</h2>
                </div>
                <p className={styles.sectionDescription}>
                  이미지 한 장과 짧은 기록이 모여 페이지의 분위기를 만듭니다.
                </p>
              </div>
              <PostCard post={featuredPost} variant="featured" />
            </section>

            {recentPosts.length > 0 && (
              <section className={styles.recentSection}>
                <div className={styles.sectionHeader}>
                  <div>
                    <p className={styles.sectionEyebrow}>Recent Works</p>
                    <h2 className={styles.sectionTitle}>최근 업로드</h2>
                  </div>
                  <p className={styles.sectionDescription}>
                    최신 게시물부터 흐름이 자연스럽게 이어지도록 카드형 목록으로 정리했습니다.
                  </p>
                </div>
                <div className={styles.grid}>
                  {recentPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            <section className={styles.archiveSection}>
              <div className={styles.archiveIntro}>
                <p className={styles.sectionEyebrow}>Archive Grid</p>
                <h2 className={styles.sectionTitle}>전체 아카이브</h2>
              </div>
              <div className={styles.archiveGrid}>
                {posts.map((post, index) => (
                  <article key={post.id} className={styles.archiveItem}>
                    <span className={styles.archiveIndex}>{String(index + 1).padStart(2, '0')}</span>
                    <PostCard post={post} compact />
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
