import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { uploadImageToStorage, validateImageFile } from "../lib/storage";
import Header from "../components/common/Header";
import RichEditor from "../components/admin/RichEditor";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import styles from "./AdminPostEditor.module.css";

export default function AdminPostEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);
  const [removedImagePath, setRemovedImagePath] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data } = await supabase.from("posts").select("*").eq("id", id).single();
    if (data) {
      setTitle(data.title);
      setContent(data.content ?? "");
      setExistingImageUrl(data.image_url);
      setExistingImagePath(data.image_path);
      setRemovedImagePath(null);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveExistingImage = () => {
    setRemovedImagePath(existingImagePath);
    setExistingImageUrl(null);
    setExistingImagePath(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }
    setSaving(true);
    setError("");

    try {
      let imageUrl = existingImageUrl ?? null;
      let imagePath = existingImagePath ?? null;
      const staleImagePath = existingImagePath ?? removedImagePath;

      if (imageFile) {
        if (staleImagePath) {
          await supabase.storage.from("artblog-images").remove([staleImagePath]);
        }
        const uploaded = await uploadImageToStorage(imageFile, "posts");
        imageUrl = uploaded.url;
        imagePath = uploaded.path;
      } else if (!existingImageUrl && removedImagePath) {
        await supabase.storage.from("artblog-images").remove([removedImagePath]);
        imageUrl = null;
        imagePath = null;
      }

      const payload = {
        title: title.trim(),
        content,
        image_url: imageUrl,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      };

      if (isEdit) {
        const { error: err } = await supabase.from("posts").update(payload).eq("id", id);
        if (err) throw err;
        navigate(`/post/${id}`);
      } else {
        const { data, error: err } = await supabase.from("posts").insert(payload).select().single();
        if (err) throw err;
        navigate(`/post/${data.id}`);
      }
    } catch (err) {
      setError("저장 중 오류가 발생했습니다: " + err.message);
    }
    setSaving(false);
  };

  const currentImage = imagePreview || existingImageUrl;

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <div className={styles.eyebrow}>{isEdit ? "editing" : "new post"}</div>
        <h1 className={styles.title}>{isEdit ? "게시글 수정" : "새 글 쓰기"}</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>제목</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-base ${styles.titleInput}`}
              placeholder="게시물 제목"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>이미지</label>
            <div className={styles.imageArea}>
              {currentImage ? (
                <div className={styles.preview}>
                  <img src={currentImage} alt="preview" className={styles.previewImg} />
                  <button
                    type="button"
                    onClick={imagePreview ? handleRemoveImage : handleRemoveExistingImage}
                    className={styles.removeBtn}
                    aria-label="이미지 제거"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={28} className={styles.uploadIcon} />
                  <span className={styles.uploadText}>클릭하여 이미지 업로드</span>
                  <span className={styles.uploadHint}>PNG, JPG, GIF · 최대 10MB</span>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className={styles.fileInput}
              />

              {currentImage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.changeBtn}
                >
                  <Upload size={13} />
                  <span>이미지 교체</span>
                </button>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>본문</label>
            <div className={styles.editorWrap}>
              <RichEditor content={content} onChange={setContent} onError={setError} />
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <div className={styles.submitRow}>
            <button
              type="button"
              onClick={() => navigate(isEdit ? `/post/${id}` : "/admin")}
              className="btn-ghost"
            >
              취소
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "저장 중..." : isEdit ? "수정 저장" : "게시하기"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
