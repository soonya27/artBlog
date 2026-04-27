import { useRef } from "react";
import { ChevronUp, ChevronDown, Plus, X } from "lucide-react";
import { validateImageFile } from "../../lib/storage";
import styles from "./SliderEditor.module.css";

function makeId() {
  return crypto.randomUUID();
}

export default function SliderEditor({ items, onItemsChange, onRemovePath, onError }) {
  const fileInputRef = useRef(null);

  const handleAdd = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        onError?.(`${file.name}: ${validationError}`);
        return;
      }
    }

    const newItems = files.map((file) => ({
      id: makeId(),
      file,
      previewUrl: URL.createObjectURL(file),
      caption: "",
    }));
    onError?.("");
    onItemsChange([...items, ...newItems]);
  };

  const handleRemove = (id) => {
    const target = items.find((item) => item.id === id);
    if (target?.path) onRemovePath?.(target.path);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleCaption = (id, caption) => {
    onItemsChange(items.map((item) => (item.id === id ? { ...item, caption } : item)));
  };

  const handleMove = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= items.length) return;
    const copy = [...items];
    [copy[index], copy[next]] = [copy[next], copy[index]];
    onItemsChange(copy);
  };

  return (
    <div className={styles.wrap}>
      {items.length > 0 && (
        <ul className={styles.list}>
          {items.map((item, index) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.imageBox}>
                <img src={item.previewUrl ?? item.url} alt="" className={styles.image} />
              </div>

              <div className={styles.body}>
                <textarea
                  value={item.caption ?? ""}
                  onChange={(e) => handleCaption(item.id, e.target.value)}
                  placeholder="이미지 설명 (선택)"
                  className={styles.caption}
                  rows={3}
                />
                <div className={styles.controls}>
                  <span className={styles.indexBadge}>{index + 1} / {items.length}</span>
                  <div className={styles.controlsRight}>
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className={styles.iconBtn}
                      aria-label="위로 이동"
                      title="위로 이동"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === items.length - 1}
                      className={styles.iconBtn}
                      aria-label="아래로 이동"
                      title="아래로 이동"
                    >
                      <ChevronDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className={`${styles.iconBtn} ${styles.removeBtn}`}
                      aria-label="삭제"
                      title="삭제"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={styles.addBtn}
      >
        <Plus size={14} />
        <span>{items.length === 0 ? "슬라이드 이미지 추가" : "이미지 더 추가"}</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAdd}
        className={styles.fileInput}
      />
    </div>
  );
}
