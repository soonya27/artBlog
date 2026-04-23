import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import styles from "./CommentSection.module.css";

function hashPassword(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

export default function CommentSection({ postId, comments, onCommentChange }) {
  const { user } = useAuth();
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nickname.trim() || !password.trim() || !content.trim()) {
      setError("모든 항목을 입력해주세요.");
      return;
    }
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("comments").insert({
      post_id: postId,
      nickname: nickname.trim(),
      password_hash: hashPassword(password),
      content: content.trim(),
    });

    if (err) {
      setError("댓글 등록에 실패했습니다.");
    } else {
      setNickname("");
      setPassword("");
      setContent("");
      onCommentChange();
    }
    setSubmitting(false);
  };

  const handleAdminDelete = async (comment) => {
    await supabase.from("comments").delete().eq("id", comment.id);
    onCommentChange();
  };

  const handleGuestDelete = async (comment) => {
    if (deleteTarget?.id !== comment.id) {
      setDeleteTarget(comment);
      setDeletePassword("");
      return;
    }
    if (hashPassword(deletePassword) === comment.password_hash) {
      await supabase.from("comments").delete().eq("id", comment.id);
      setDeleteTarget(null);
      setDeletePassword("");
      onCommentChange();
    } else {
      alert("비밀번호가 맞지 않습니다.");
    }
  };

  const visibleComments = comments.filter((c) => !c.is_deleted);

  return (
    <section className={styles.section}>
      <div className={styles.heading}>comments · {visibleComments.length}</div>

      {visibleComments.length === 0 && (
        <p className={styles.empty}>첫 댓글을 남겨주세요.</p>
      )}

      <div className={styles.list}>
        {visibleComments.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <div className={styles.commentHeader}>
              <span className={styles.nickname}>{comment.nickname}</span>
              <span className={styles.time}>{formatDate(comment.created_at)}</span>
              <div className={styles.spacer} />
              {user ? (
                <button
                  type="button"
                  onClick={() => handleAdminDelete(comment)}
                  className="btn-danger"
                >
                  삭제
                </button>
              ) : (
                deleteTarget?.id !== comment.id && (
                  <button
                    type="button"
                    onClick={() => handleGuestDelete(comment)}
                    className={styles.deleteLink}
                  >
                    삭제
                  </button>
                )
              )}
            </div>

            <p className={styles.commentContent}>{comment.content}</p>

            {!user && deleteTarget?.id === comment.id && (
              <div className={styles.deleteConfirm}>
                <input
                  type="password"
                  placeholder="작성 시 입력한 비밀번호"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className={`input-base ${styles.deleteInput}`}
                  onKeyDown={(e) => e.key === "Enter" && handleGuestDelete(comment)}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-danger"
                  onClick={() => handleGuestDelete(comment)}
                >
                  확인
                </button>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setDeleteTarget(null);
                    setDeletePassword("");
                  }}
                >
                  취소
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="input-base"
            maxLength={20}
          />
          <input
            type="password"
            placeholder="비밀번호 (삭제 시 필요)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-base"
            maxLength={20}
          />
        </div>
        <textarea
          placeholder="남기고 싶은 말을 적어주세요"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`input-base ${styles.textarea}`}
          rows={3}
          maxLength={500}
        />
        <div className={styles.formActions}>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "등록 중..." : "댓글 남기기"}
          </button>
        </div>
      </form>
    </section>
  );
}
