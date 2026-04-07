import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline as UnderlineIcon,
  AlignLeft, AlignCenter, AlignRight,
  List, ListOrdered, Link as LinkIcon,
  Heading2, Heading3, Quote, Undo, Redo, Image as ImageIcon
} from 'lucide-react'
import { uploadImageToStorage, validateImageFile } from '../../lib/storage'
import styles from './RichEditor.module.css'

const ToolbarButton = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${styles.toolbarBtn} ${active ? styles.active : ''}`}
    title={title}
  >
    {children}
  </button>
)

export default function RichEditor({ content, onChange, onError }) {
  const imageInputRef = useRef(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
      Placeholder.configure({ placeholder: '내용을 입력하세요...' }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return

    const nextContent = content || ''
    if (editor.getHTML() === nextContent) return

    editor.commands.setContent(nextContent, false)
  }, [content, editor])

  if (!editor) return null

  const setLink = () => {
    const url = window.prompt('URL 입력:', editor.getAttributes('link').href)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImageSelect = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      onError?.(validationError)
      return
    }

    setUploadingImage(true)
    onError?.('')

    try {
      const uploaded = await uploadImageToStorage(file, 'editor')
      editor.chain().focus().setImage({ src: uploaded.url, alt: file.name }).run()
    } catch (error) {
      onError?.('본문 이미지 업로드 중 오류가 발생했습니다: ' + error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  return (
    <div className={styles.editorWrap}>
      <div className={styles.toolbar}>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="제목2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="제목3">
          <Heading3 size={15} />
        </ToolbarButton>
        <div className={styles.divider} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="굵게">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="기울임">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="밑줄">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <div className={styles.divider} />
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="좌정렬">
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="가운데정렬">
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="우정렬">
          <AlignRight size={15} />
        </ToolbarButton>
        <div className={styles.divider} />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="목록">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="번호 목록">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="인용">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={setLink} active={editor.isActive('link')} title="링크">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => imageInputRef.current?.click()}
          title={uploadingImage ? '이미지 업로드 중...' : '이미지 업로드'}
        >
          <ImageIcon size={15} />
        </ToolbarButton>
        <div className={styles.divider} />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="실행취소">
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="다시실행">
          <Redo size={15} />
        </ToolbarButton>
      </div>
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className={styles.hiddenInput}
      />
      <EditorContent editor={editor} className={styles.editor} />
    </div>
  )
}
