import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { removeImages } from "../lib/storage";
import { collectPostImagePaths } from "../lib/postCleanup";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/common/Header";
import CommentSection from "../components/public/CommentSection";
import PostSlider from "../components/public/PostSlider";
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
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    setPost(data);
    setLoading(false);
    if (data) fetchAdjacentPosts(data.created_at);
  };

  const fetchAdjacentPosts = async (createdAt) => {
    const [{ data: prev }, { data: next }] = await Promise.all([
      supabase.from("posts").select("id, title").eq("is_hidden", false).lt("created_at", createdAt).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("posts").select("id, title").eq("is_hidden", false).gt("created_at", createdAt).order("created_at", { ascending: true }).limit(1).maybeSingle(),
    ]);
    setPrevPost(prev);
    setNextPost(next);
  };

  const fetchComments = async () => {
    const { data } = await supabase.from("comments").select("*").eq("post_id", id).order("created_at", { ascending: true });
    setComments(data ?? []);
  };

  const handleDelete = async () => {
    if (!window.confirm("이 게시물을 삭제할까요?")) return;
    const paths = collectPostImagePaths(post);
    if (paths.length > 0) await removeImages(paths);
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

  if (!post || (post.is_hidden && !user)) {
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

        <article className={styles.hero}>
          {post.image_url && (
            <div className={styles.heroCover}>
              <img src={post.image_url} alt={post.title} className={styles.heroCoverImage} />
            </div>
          )}
          <div className={`${styles.heroCaption} ${post.image_url ? styles.heroCaptionWithCover : ""}`}>
            <div className={styles.metaDate}>
              {formatDate(post.created_at)}
              {post.is_hidden && user && <span className={styles.hiddenBadge}>비공개</span>}
            </div>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.heroStats}>
              <MessageCircle size={14} strokeWidth={1.5} aria-hidden="true" />
              <span>{comments.length}</span>
            </div>
          </div>
        </article>

        {Array.isArray(post.slider_images) && post.slider_images.length > 0 && (
          <section className={styles.gallerySection}>
            {/* <div className={styles.galleryHeader}>
              <span className={styles.galleryHeading}>Slides</span>
              <hr className={styles.galleryHairline} />
              <span className={styles.gallerySlideCount}>{post.slider_images.length} Images</span>
            </div> */}
            <PostSlider items={post.slider_images} />
          </section>
        )}

        {post.content && <div className={styles.body} dangerouslySetInnerHTML={{ __html: post.content }} />}

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

        <nav className={styles.postNav} aria-label="게시글 네비게이션">
          {prevPost ? (
            <Link to={`/post/${prevPost.id}`} className={`${styles.navItem} ${styles.navPrev}`}>
              <span className={styles.navLabel}>← 이전글</span>
              <span className={styles.navTitle}>{prevPost.title}</span>
            </Link>
          ) : (
            <span className={`${styles.navItem} ${styles.navPrev} ${styles.navDisabled}`}>
              <span className={styles.navLabel}>← 이전글</span>
              <span className={styles.navTitle}>이전 글이 없습니다</span>
            </span>
          )}
          {nextPost ? (
            <Link to={`/post/${nextPost.id}`} className={`${styles.navItem} ${styles.navNext}`}>
              <span className={styles.navLabel}>다음글 →</span>
              <span className={styles.navTitle}>{nextPost.title}</span>
            </Link>
          ) : (
            <span className={`${styles.navItem} ${styles.navNext} ${styles.navDisabled}`}>
              <span className={styles.navLabel}>다음글 →</span>
              <span className={styles.navTitle}>다음 글이 없습니다</span>
            </span>
          )}
        </nav>

        <hr className={styles.divider} />

        <div className={styles.commentsWrap}>
          <CommentSection postId={id} comments={comments} onCommentChange={fetchComments} />
        </div>
      </main>
    </div>
  );
}
