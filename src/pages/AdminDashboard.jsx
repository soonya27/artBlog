import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plus, Edit2, Trash2, MessageCircle, LogOut, Home } from 'lucide-react'
import styles from './AdminDashboard.module.css'

function timeFormat(dateStr) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export default function AdminDashboard() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id, title, image_url, image_path, created_at, comments(count)')
      .order('created_at', { ascending: false })

    if (data) {
      setPosts(data.map(p => ({
        ...p,
        comment_count: p.comments?.[0]?.count ?? 0,
      })))
    }
    setLoading(false)
  }

  const handleDelete = async (post) => {
    if (!confirm(`"${post.title}" 을(를) 삭제하시겠습니까?`)) return
    if (post.image_path) {
      await supabase.storage.from('artblog-images').remove([post.image_path])
    }
    await supabase.from('posts').delete().eq('id', post.id)
    fetchPosts()
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span className={styles.logoText}>Artblog</span>
          <span className={styles.logoDot}>·</span>
        </div>
        <nav className={styles.sidebarNav}>
          <Link to="/" className={styles.sidebarLink}>
            <Home size={16} />
            <span>사이트 보기</span>
          </Link>
          <Link to="/admin/new" className={styles.sidebarLinkAccent}>
            <Plus size={16} />
            <span>새 게시물</span>
          </Link>
        </nav>
        <button onClick={async () => { await signOut(); navigate('/') }} className={styles.signOutBtn}>
          <LogOut size={14} />
          <span>로그아웃</span>
        </button>
      </aside>

      <main className={styles.main}>
        <div className={styles.topBar}>
          <h1 className={styles.heading}>게시물 관리</h1>
          <span className={styles.postCount}>{posts.length}개</span>
        </div>

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <p>게시물이 없습니다.</p>
            <Link to="/admin/new" className="btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
              첫 게시물 작성
            </Link>
          </div>
        ) : (
          <div className={styles.table}>
            <div className={styles.tableHeader}>
              <span>이미지</span>
              <span>제목</span>
              <span>댓글</span>
              <span>날짜</span>
              <span>관리</span>
            </div>
            {posts.map(post => (
              <div key={post.id} className={styles.tableRow}>
                <div className={styles.thumb}>
                  {post.image_url
                    ? <img src={post.image_url} alt="" className={styles.thumbImg} />
                    : <div className={styles.thumbEmpty} />
                  }
                </div>
                <div className={styles.postTitle}>
                  <Link to={`/post/${post.id}`} className={styles.titleLink}>
                    {post.title}
                  </Link>
                </div>
                <div className={styles.commentCount}>
                  <MessageCircle size={13} />
                  {post.comment_count}
                </div>
                <div className={styles.date}>{timeFormat(post.created_at)}</div>
                <div className={styles.actions}>
                  <Link to={`/admin/edit/${post.id}`} className={styles.editBtn} title="수정">
                    <Edit2 size={14} />
                  </Link>
                  <button onClick={() => handleDelete(post)} className={styles.deleteBtn} title="삭제">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
