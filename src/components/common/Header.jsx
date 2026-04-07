import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut, Settings } from "lucide-react";
import styles from "./Header.module.css";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className={styles.header}>
      <Link to="/about" className={styles.logo}>
        <span className={styles.logoText}>Artblog</span>
        <span className={styles.logoDot}>·</span>
      </Link>
      <nav className={styles.nav}>
        <div className={styles.mainNav}>
          <NavLink to="/artworks" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
            Artworks
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
            About
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}>
            Contact
          </NavLink>
        </div>

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
        ) : null}
      </nav>
    </header>
  );
}
