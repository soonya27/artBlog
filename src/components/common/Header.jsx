import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
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

        <span className={styles.navDivider} />

        {user ? (
          <>
            <Link to="/admin" className="btn-ghost">
              관리
            </Link>
            <button onClick={handleSignOut} className="btn-ghost">
              로그아웃
            </button>
          </>
        ) : (
          <Link to="/admin/login" className="btn-ghost">
            로그인
          </Link>
        )}
      </nav>
    </header>
  );
}
