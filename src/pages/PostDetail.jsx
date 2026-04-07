import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import Header from '../components/common/Header'
import CommentSection from '../components/public/CommentSection'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import styles from './PostDetail.module.css'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchPost(); fetchComments() }, [id])

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    setPost(data)
    setLoading(false)
  }

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }

  const handleDelete = async () => {
    if (!window.confirm('이 게시물을 삭제할까요?')) return
    if (post.image_path) {
      await supabase.storage.from('artblog-images').remove([post.image_path])
    }
    await supabase.from('posts').delete().eq('id', id)
    navigate('/artworks')
  }

  if (loading) return <div className={styles.loading}><Header />Loading...</div>
  if (!post) return <div className={styles.loading}><Header /><p>게시물을 찾을 수 없습니다.</p></div>

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <Link to="/artworks" className={styles.back}><ArrowLeft size={16} /> 아카이브로</Link>
          {user && (
            <div className={styles.actions}>
              <Link to={`/admin/edit/${id}`} className={`btn-ghost ${styles.actionBtn}`}>
                <Pencil size={14} /> 수정
              </Link>
              <button onClick={handleDelete} className={`btn-ghost ${styles.actionBtn} ${styles.danger}`}>
                <Trash2 size={14} /> 삭제
              </button>
            </div>
          )}
        </div>

        <article className={styles.article}>
          {post.image_url && (
            <div className={styles.imageWrap}>
              <img src={post.image_url} alt={post.title} className={styles.image} />
            </div>
          )}
          <div className={styles.content}>
            <h1 className={styles.title}>{post.title}</h1>
            <p className={styles.date}>
              {new Date(post.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            {post.content && (
              <div
                className={styles.body}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            )}
          </div>
        </article>

        <CommentSection
          postId={id}
          comments={comments}
          onCommentChange={fetchComments}
        />
      </main>
    </div>
  )
}
