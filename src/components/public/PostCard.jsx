import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import styles from './PostCard.module.css'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function PostCard({ post, variant = 'default', compact = false }) {
  if (variant === 'gallery') {
    return (
      <Link to={`/post/${post.id}`} className={styles.galleryCard}>
        <div className={styles.galleryImageWrap}>
          {post.image_url ? (
            <img src={post.image_url} alt={post.title} className={styles.galleryImage} loading="lazy" />
          ) : (
            <div className={styles.galleryNoImage}>
              <span>No Image</span>
            </div>
          )}
          <div className={styles.galleryOverlay}>
            <div className={styles.galleryOverlayContent}>
              <p className={styles.galleryDate}>{formatDate(post.created_at)}</p>
              <h3 className={styles.galleryTitle}>{post.title}</h3>
              {(post.comment_count ?? 0) > 0 && (
                <span className={styles.galleryComments}>
                  <MessageCircle size={11} />
                  {post.comment_count}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  const cardClassName = [
    styles.card,
    variant === 'featured' ? styles.featured : '',
    compact ? styles.compact : '',
  ].filter(Boolean).join(' ')

  return (
    <Link to={`/post/${post.id}`} className={cardClassName}>
      <div className={styles.imageWrap}>
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage}>
            <span>No Image</span>
          </div>
        )}
        <div className={styles.overlay}>
          <div className={styles.overlayContent}>
            <p className={styles.date}>{formatDate(post.created_at)}</p>
            <h3 className={styles.title}>{post.title}</h3>
            {!compact && post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
            <div className={styles.meta}>
              <span className={styles.commentCount}>
                <MessageCircle size={13} />
                {post.comment_count ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
