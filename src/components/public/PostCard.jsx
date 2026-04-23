import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
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
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{post.title}</div>
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
