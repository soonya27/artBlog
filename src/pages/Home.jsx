import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Header from "../components/common/Header";
import PostCard from "../components/public/PostCard";
import styles from "./Home.module.css";

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
            <section className={styles.intro}>
              <p className={styles.quote}>
                느리게 그리고, 오래 들여다본 것들을 모아둔 작은 작업실입니다.
              </p>
              <div className={styles.meta}>
                <hr className={styles.metaRule} />
                <span className={styles.metaLabel}>{posts.length}점 · 시간순</span>
              </div>
            </section>

            <section className={styles.gallery}>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
