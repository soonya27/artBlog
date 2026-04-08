import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/common/Header";
import PostCard from "../components/public/PostCard";
import styles from "./Home.module.css";

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("id, title, image_url, created_at, content")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const postsWithCounts = await Promise.all(
        data.map(async (post) => {
          const { count } = await supabase
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("post_id", post.id)
            .eq("is_deleted", false);
          return { ...post, comment_count: count ?? 0 };
        }),
      );
      setPosts(postsWithCounts);
    }
    setLoading(false);
  };

  const latestPost = posts[0] ?? null;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>아직 게시물이 없습니다</div>
        ) : (
          <>
            <section className={styles.visual}>
              <h1 className={styles.title}>Artworks</h1>
              <div className={styles.meta}>
                <span className={styles.metaItem}>{posts.length} works</span>
                <span className={styles.metaDot}>·</span>
                <span className={styles.metaItem}>Updated {formatDate(latestPost.created_at)}</span>
              </div>
            </section>

            <section className={styles.gallery}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} variant="gallery" />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
