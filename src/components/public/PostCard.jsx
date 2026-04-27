import { Link } from "react-router-dom";
import { MessageCircle, Lock } from "lucide-react";
import styles from "./PostCard.module.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function PostCard({ post }) {
  return (
    <Link to={`/post/${post.id}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className={styles.image} loading="lazy" />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
        {post.has_password && (
          <span className={styles.lockBadge} aria-label="비밀번호 보호 게시글">
            <Lock size={12} strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.title}>
          {post.has_password && <Lock size={13} strokeWidth={1.75} className={styles.titleLock} aria-hidden="true" />}
          {post.title}
        </div>
        <div className={styles.meta}>
          <span>{formatDate(post.created_at)}</span>
          <span className={styles.comments}>
            <MessageCircle size={12} />
            {post.comment_count ?? 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
