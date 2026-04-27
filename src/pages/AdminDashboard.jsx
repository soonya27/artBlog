import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Unlock } from "lucide-react";
import { supabase } from "../lib/supabase";
import { removeImages } from "../lib/storage";
import { collectPostImagePaths } from "../lib/postCleanup";
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
      .select("id, title, image_url, image_path, is_hidden, has_password, created_at, comments(count), post_passwords(password)")
      .order("created_at", { ascending: false });

    if (data) {
      setPosts(
        data.map((p) => ({
          ...p,
          comment_count: p.comments?.[0]?.count ?? 0,
          post_password: p.post_passwords?.[0]?.password ?? null,
        })),
      );
    }
    setLoading(false);
  };

  const handleDelete = async (post) => {
    if (!confirm(`"${post.title}" 을(를) 삭제하시겠습니까?`)) return;
    const { data: full } = await supabase
      .from("posts")
      .select("image_path, slider_images, content")
      .eq("id", post.id)
      .maybeSingle();
    const paths = collectPostImagePaths(full);
    if (paths.length > 0) await removeImages(paths);
    await supabase.from("posts").delete().eq("id", post.id);
    fetchPosts();
  };

  const handleToggleHidden = async (post) => {
    const next = !post.is_hidden;
    const { error } = await supabase.from("posts").update({ is_hidden: next }).eq("id", post.id);
    if (error) {
      alert("비공개 설정 변경 실패: " + error.message);
      return;
    }
    setPosts((prev) => prev.map((p) => (p.id === post.id ? { ...p, is_hidden: next } : p)));
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
            <Link to="/admin/gallery-order" className="btn-ghost">
              메인페이지 수정
            </Link>
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
                  <div className={styles.meta}>
                    {post.is_hidden && <span className={styles.hiddenBadge}>비공개</span>}
                    {post.has_password && (
                      <span className={styles.passwordBadge} title="이 게시글은 비밀번호로 보호되어 있습니다">
                        <Lock size={10} strokeWidth={2} />
                        <span className={styles.passwordValue}>{post.post_password ?? "비밀번호"}</span>
                      </span>
                    )}
                    <span>{post.comment_count} 댓글</span>
                  </div>
                </div>

                <div className={styles.date}>{formatDate(post.created_at)}</div>

                <div className={styles.rowActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleHidden(post)}
                    className={`${styles.lockBtn} ${post.is_hidden ? styles.lockBtnOn : ""}`}
                    title={post.is_hidden ? "공개로 전환" : "비공개로 전환"}
                    aria-label={post.is_hidden ? "공개로 전환" : "비공개로 전환"}
                    aria-pressed={post.is_hidden}
                  >
                    {post.is_hidden ? <Lock size={14} strokeWidth={1.75} /> : <Unlock size={14} strokeWidth={1.75} />}
                  </button>
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
