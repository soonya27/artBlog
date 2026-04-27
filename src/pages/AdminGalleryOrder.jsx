import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import Header from "../components/common/Header";
import styles from "./AdminGalleryOrder.module.css";

function formatDate(dateString) {
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function SortableCard({ post }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 5 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={styles.card}
      data-dragging={isDragging || undefined}
      {...attributes}
      {...listeners}
    >
      <div className={styles.imageWrap}>
        {post.image_url ? (
          <img src={post.image_url} alt={post.title} className={styles.image} loading="lazy" draggable={false} />
        ) : (
          <div className={styles.noImage}>No Image</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.cardTitle}>{post.title}</div>
        <div className={styles.meta}>
          <span>{formatDate(post.created_at)}</span>
          <span className={styles.comments}>
            <MessageCircle size={12} />
            {post.comment_count ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminGalleryOrder() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [initialOrder, setInitialOrder] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error: err } = await supabase
      .from("posts")
      .select("id, title, image_url, created_at, display_order")
      .eq("is_hidden", false)
      .order("display_order", { ascending: true });

    if (err) {
      setError("게시물을 불러오지 못했습니다: " + err.message);
      setLoading(false);
      return;
    }

    if (data) {
      const withCounts = await Promise.all(
        data.map(async (post) => {
          const { count } = await supabase
            .from("comments")
            .select("id", { count: "exact", head: true })
            .eq("post_id", post.id)
            .eq("is_deleted", false);
          return { ...post, comment_count: count ?? 0 };
        })
      );
      setPosts(withCounts);
      setInitialOrder(withCounts.map((p) => p.id));
    }
    setLoading(false);
  };

  const isDirty = posts.some((p, i) => initialOrder[i] !== p.id);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = posts.findIndex((p) => p.id === active.id);
    const newIndex = posts.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setPosts((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  const handleReset = () => {
    if (!isDirty) return;
    if (!confirm("변경사항을 취소하고 처음 상태로 되돌립니다.")) return;
    const byId = new Map(posts.map((p) => [p.id, p]));
    setPosts(initialOrder.map((id) => byId.get(id)).filter(Boolean));
  };

  const handleSave = async () => {
    if (!isDirty) return;
    setSaving(true);
    setError("");

    const updates = posts.map((post, i) => ({
      id: post.id,
      display_order: i + 1,
    }));

    try {
      for (const u of updates) {
        const { error: err } = await supabase
          .from("posts")
          .update({ display_order: u.display_order })
          .eq("id", u.id);
        if (err) throw err;
      }
      setInitialOrder(posts.map((p) => p.id));
      navigate("/admin");
    } catch (err) {
      setError("저장 중 오류가 발생했습니다: " + err.message);
    }
    setSaving(false);
  };

  const handleCancel = () => {
    if (isDirty && !confirm("저장하지 않은 변경사항이 있습니다. 나가시겠습니까?")) return;
    navigate("/admin");
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div>
            <div className={styles.eyebrow}>main page order</div>
            <h1 className={styles.title}>메인페이지 수정</h1>
            <p className={styles.desc}>드래그하여 메인페이지 갤러리의 노출 순서를 변경하세요. 게시글 자체는 수정되지 않습니다.</p>
          </div>
          <Link
            to="/admin"
            className={styles.backBtn}
            onClick={(e) => {
              if (isDirty && !confirm("저장하지 않은 변경사항이 있습니다. 나가시겠습니까?")) e.preventDefault();
            }}
          >
            ← 목록으로
          </Link>
        </div>

        <div className={styles.actions}>
          <button type="button" onClick={handleReset} disabled={!isDirty || saving} className="btn-ghost">
            초기화
          </button>
          <button type="button" onClick={handleSave} disabled={!isDirty || saving} className="btn-primary">
            {saving ? "저장 중..." : "순서 저장"}
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.loading}>불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>아직 게시물이 없습니다</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={posts.map((p) => p.id)} strategy={rectSortingStrategy}>
              <section className={styles.gallery}>
                {posts.map((post) => (
                  <SortableCard key={post.id} post={post} />
                ))}
              </section>
            </SortableContext>
          </DndContext>
        )}

        {!loading && posts.length > 0 && (
          <div className={styles.footerActions}>
            <button type="button" onClick={handleCancel} className="btn-ghost">
              취소
            </button>
            <button type="button" onClick={handleSave} disabled={!isDirty || saving} className="btn-primary">
              {saving ? "저장 중..." : "순서 저장"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
