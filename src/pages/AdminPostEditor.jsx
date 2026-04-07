import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import RichEditor from '../components/admin/RichEditor'
import { ArrowLeft, Upload, X, Image as ImageIcon } from 'lucide-react'
import styles from './AdminPostEditor.module.css'

export default function AdminPostEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const fileInputRef = useRef(null)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState(null)
  const [existingImagePath, setExistingImagePath] = useState(null)
  const [removedImagePath, setRemovedImagePath] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit) fetchPost()
  }, [id])

  const fetchPost = async () => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).single()
    if (data) {
      setTitle(data.title)
      setContent(data.content ?? '')
      setExistingImageUrl(data.image_url)
      setExistingImagePath(data.image_path)
      setRemovedImagePath(null)
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드 가능합니다.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('파일 크기는 10MB 이하여야 합니다.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemoveExistingImage = () => {
    setRemovedImagePath(existingImagePath)
    setExistingImageUrl(null)
    setExistingImagePath(null)
  }

  const uploadImage = async (file) => {
    const ext = file.name.split('.').pop()
    const path = `posts/${Date.now()}.${ext}`
    const { error } = await supabase.storage
      .from('artblog-images')
      .upload(path, file, { contentType: file.type })
    if (error) throw error
    const { data } = supabase.storage.from('artblog-images').getPublicUrl(path)
    return { url: data.publicUrl, path }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }
    setSaving(true)
    setError('')

    try {
      let imageUrl = existingImageUrl ?? null
      let imagePath = existingImagePath ?? null
      const staleImagePath = existingImagePath ?? removedImagePath

      // Upload new image if selected
      if (imageFile) {
        // Delete old image if replacing
        if (staleImagePath) {
          await supabase.storage.from('artblog-images').remove([staleImagePath])
        }
        const uploaded = await uploadImage(imageFile)
        imageUrl = uploaded.url
        imagePath = uploaded.path
      } else if (!existingImageUrl && removedImagePath) {
        // Image was removed
        await supabase.storage.from('artblog-images').remove([removedImagePath])
        imageUrl = null
        imagePath = null
      }

      const payload = {
        title: title.trim(),
        content,
        image_url: imageUrl,
        image_path: imagePath,
        updated_at: new Date().toISOString(),
      }

      if (isEdit) {
        const { error: err } = await supabase.from('posts').update(payload).eq('id', id)
        if (err) throw err
        navigate(`/post/${id}`)
      } else {
        const { data, error: err } = await supabase.from('posts').insert(payload).select().single()
        if (err) throw err
        navigate(`/post/${data.id}`)
      }
    } catch (err) {
      setError('저장 중 오류가 발생했습니다: ' + err.message)
    }
    setSaving(false)
  }

  const currentImage = imagePreview || existingImageUrl

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/admin" className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>대시보드</span>
        </Link>
        <h1 className={styles.pageTitle}>{isEdit ? '게시물 수정' : '새 게시물'}</h1>
        <div className={styles.topActions}>
          <button
            type="button"
            onClick={() => navigate(isEdit ? `/post/${id}` : '/admin')}
            className="btn-ghost"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary"
          >
            {saving ? '저장 중...' : isEdit ? '수정 완료' : '게시하기'}
          </button>
        </div>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.layout}>
          {/* Left: Main content */}
          <div className={styles.mainCol}>
            <div className={styles.field}>
              <label className={styles.label}>제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className={`input-base ${styles.titleInput}`}
                placeholder="게시물 제목"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>내용</label>
              <RichEditor content={content} onChange={setContent} />
            </div>
          </div>

          {/* Right: Image upload */}
          <div className={styles.sideCol}>
            <div className={styles.field}>
              <label className={styles.label}>이미지</label>

              {currentImage ? (
                <div className={styles.imagePreviewWrap}>
                  <img src={currentImage} alt="preview" className={styles.previewImg} />
                  <button
                    type="button"
                    onClick={imagePreview ? handleRemoveImage : handleRemoveExistingImage}
                    className={styles.removeImageBtn}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div
                  className={styles.uploadZone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={32} className={styles.uploadIcon} />
                  <p className={styles.uploadText}>클릭하여 이미지 업로드</p>
                  <p className={styles.uploadHint}>PNG, JPG, GIF · 최대 10MB</p>
                </div>
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
                  className={styles.changeImageBtn}
                >
                  <Upload size={13} />
                  <span>이미지 교체</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}
