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
      <Link to="/artworks" className={styles.brand}>
        <span className={styles.brandName}>artblog</span>
        <span className={styles.brandTagline}>an atelier journal</span>
      </Link>

      <nav className={styles.nav}>
        <NavLink
          to="/artworks"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
        >
          Home
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
        >
          About
        </NavLink>
        <NavLink
          to="/contact"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
        >
          Contact
        </NavLink>

        {user && (
          <>
            <span className={styles.navDivider} />
            <Link to="/admin" className={styles.iconLink}>
              <Settings size={15} />
              <span>관리</span>
            </Link>
            <button
              onClick={handleSignOut}
              className={`${styles.iconLink} ${styles.logoutBtn}`}
            >
              <LogOut size={15} />
              <span>로그아웃</span>
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
