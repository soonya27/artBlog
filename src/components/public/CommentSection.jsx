import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Trash2, Send } from 'lucide-react'
import styles from './CommentSection.module.css'

function hashPassword(str) {
  // Simple hash for client-side (not cryptographic - just for basic protection)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

export default function CommentSection({ postId, comments, onCommentChange }) {
  const { user } = useAuth()
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deletePassword, setDeletePassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!nickname.trim() || !password.trim() || !content.trim()) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    setSubmitting(true)
    setError('')

    const { error: err } = await supabase.from('comments').insert({
      post_id: postId,
      nickname: nickname.trim(),
      password_hash: hashPassword(password),
      content: content.trim(),
    })

    if (err) {
      setError('댓글 등록에 실패했습니다.')
    } else {
      setNickname('')
      setPassword('')
      setContent('')
      onCommentChange()
    }
    setSubmitting(false)
  }

  const handleDelete = async (comment) => {
    if (user) {
      // Admin: delete directly
      await supabase.from('comments').delete().eq('id', comment.id)
      onCommentChange()
      return
    }
    // Guest: check password
    if (deleteTarget?.id === comment.id) {
      if (hashPassword(deletePassword) === comment.password_hash) {
        await supabase.from('comments').delete().eq('id', comment.id)
        setDeleteTarget(null)
        setDeletePassword('')
        onCommentChange()
      } else {
        alert('비밀번호가 맞지 않습니다.')
      }
      return
    }
    setDeleteTarget(comment)
    setDeletePassword('')
  }

  const visibleComments = comments.filter(c => !c.is_deleted)

  return (
    <div className={styles.section}>
      <h3 className={styles.heading}>
        댓글 <span className={styles.count}>{visibleComments.length}</span>
      </h3>

      {/* Comment list */}
      <div className={styles.list}>
        {visibleComments.length === 0 && (
          <p className={styles.empty}>첫 번째 댓글을 남겨보세요</p>
        )}
        {visibleComments.map(comment => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.nickname}>{comment.nickname}</span>
              <span className={styles.time}>{timeAgo(comment.created_at)}</span>
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(comment)}
                title="삭제"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <p className={styles.commentContent}>{comment.content}</p>
            {/* Password delete modal for guest */}
            {!user && deleteTarget?.id === comment.id && (
              <div className={styles.deleteConfirm}>
                <input
                  type="password"
                  placeholder="댓글 비밀번호 입력"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  className={`${styles.deleteInput} input-base`}
                  onKeyDown={e => e.key === 'Enter' && handleDelete(comment)}
                />
                <button className="btn-primary" onClick={() => handleDelete(comment)} style={{ padding: '8px 14px', fontSize: '12px' }}>확인</button>
                <button className="btn-ghost" onClick={() => setDeleteTarget(null)} style={{ padding: '8px 14px', fontSize: '12px' }}>취소</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            className={`input-base ${styles.shortInput}`}
            maxLength={20}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={`input-base ${styles.shortInput}`}
            maxLength={20}
          />
        </div>
        <div className={styles.contentRow}>
          <textarea
            placeholder="댓글을 입력하세요..."
            value={content}
            onChange={e => setContent(e.target.value)}
            className={`input-base ${styles.textarea}`}
            rows={3}
            maxLength={500}
          />
          <button type="submit" disabled={submitting} className={styles.submitBtn}>
            <Send size={16} />
          </button>
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}
