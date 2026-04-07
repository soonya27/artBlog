import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LogOut, Settings } from 'lucide-react'
import styles from './Header.module.css'

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoText}>Artblog</span>
        <span className={styles.logoDot}>·</span>
      </Link>
      <nav className={styles.nav}>
        {user ? (
          <>
            <Link to="/admin" className={styles.navLink}>
              <Settings size={15} />
              <span>관리</span>
            </Link>
            <button onClick={handleSignOut} className={styles.navLink}>
              <LogOut size={15} />
              <span>로그아웃</span>
            </button>
          </>
        ) : (
          <Link to="/admin/login" className={styles.navLinkMuted}>관리자</Link>
        )}
      </nav>
    </header>
  )
}
