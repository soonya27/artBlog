import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/common/Header";
import CommentSection from "../components/public/CommentSection";
import styles from "./PostDetail.module.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from("posts").select("*").eq("id", id).single();
    setPost(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
    setComments(data ?? []);
  };

  const handleDelete = async () => {
    if (!window.confirm("이 게시물을 삭제할까요?")) return;
    if (post.image_path) {
      await supabase.storage.from("artblog-images").remove([post.image_path]);
    }
    await supabase.from("posts").delete().eq("id", id);
    navigate("/artworks");
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.page}>
        <Header />
        <div className={styles.loading}>게시물을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <Link to="/artworks" className={styles.back}>
          ← back to feed
        </Link>

        <header className={styles.articleHeader}>
          <div className={styles.metaDate}>{formatDate(post.created_at)}</div>
          <h1 className={styles.title}>{post.title}</h1>
        </header>

        {post.image_url && (
          <div className={styles.gallery}>
            <img src={post.image_url} alt={post.title} className={styles.galleryImage} />
          </div>
        )}

        {post.content && (
          <div
            className={styles.body}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {user && (
          <div className={styles.adminBar}>
            <span className={styles.adminLabel}>admin</span>
            <Link to={`/admin/edit/${id}`} className="btn-ghost">
              게시글 수정
            </Link>
            <button onClick={handleDelete} className="btn-danger">
              삭제
            </button>
          </div>
        )}

        <hr className={styles.divider} />

        <CommentSection postId={id} comments={comments} onCommentChange={fetchComments} />
      </main>
    </div>
  );
}
