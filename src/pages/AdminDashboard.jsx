import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/common/Header";
import styles from "./AdminDashboard.module.css";

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data } = await supabase
      .from("posts")
      .select("id, title, image_url, image_path, created_at, comments(count)")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(
        data.map((p) => ({
          ...p,
          comment_count: p.comments?.[0]?.count ?? 0,
        })),
      );
    }
    setLoading(false);
  };

  const handleDelete = async (post) => {
    if (!confirm(`"${post.title}" 을(를) 삭제하시겠습니까?`)) return;
    if (post.image_path) {
      await supabase.storage.from("artblog-images").remove([post.image_path]);
    }
    await supabase.from("posts").delete().eq("id", post.id);
    fetchPosts();
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.eyebrow}>admin dashboard</div>
            <h1 className={styles.title}>작업실 관리</h1>
          </div>
          <div className={styles.actions}>
            <Link to="/admin/site-settings" className="btn-ghost">
              사이트 설정
            </Link>
            <Link to="/admin/new" className="btn-primary">
              + 새 글 쓰기
            </Link>
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <p>게시물이 없습니다.</p>
            <Link to="/admin/new" className="btn-primary" style={{ marginTop: 16, display: "inline-block" }}>
              첫 게시물 작성
            </Link>
          </div>
        ) : (
          <div className={styles.table}>
            {posts.map((post, i) => (
              <div key={post.id} className={styles.row} data-first={i === 0 || undefined}>
                <div className={styles.thumb}>
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className={styles.thumbImg} />
                  ) : (
                    <div className={styles.thumbEmpty} />
                  )}
                </div>

                <div className={styles.titleCol}>
                  <Link to={`/post/${post.id}`} className={styles.titleLink}>
                    {post.title}
                  </Link>
                  <div className={styles.meta}>{post.comment_count} 댓글</div>
                </div>

                <div className={styles.date}>{formatDate(post.created_at)}</div>

                <div className={styles.rowActions}>
                  <Link to={`/post/${post.id}`} className="btn-ghost">
                    보기
                  </Link>
                  <Link to={`/admin/edit/${post.id}`} className="btn-ghost">
                    수정
                  </Link>
                  <button onClick={() => handleDelete(post)} className="btn-danger">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className={styles.footerActions}>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="btn-ghost"
          >
            로그아웃
          </button>
        </div>
      </main>
    </div>
  );
}
