import logo from "../assets/react.svg";
import { navbarStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import axios from "axios";
import type { User } from "../types/user";

const BASE_URL = "http://localhost:4000/api";

/* ---------- Types ---------- */

// Props passed in by the parent (both optional)
type NavbarProps = {
  user?: User | null;
  onLogout?: () => void;
};

// Shape of the response from GET /api/user/me
type MeResponse = {
  success: boolean;
  user?: User;
  message?: string;
};

export default function Navbar({ user: propUser, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  // User loaded by this component when the parent doesn't pass one
  const [fetchedUser, setFetchedUser] = useState<User | null>(null);

  // Prefer the user from props, otherwise use the fetched one
  const user: User | null = propUser ?? fetchedUser;

  const toggleMenu = (): void => setMenuOpen((prev) => !prev);

  // Fetch the user from the API only when the parent didn't provide one
  useEffect(() => {
    if (propUser) return;

    const fetchUserData = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get<MeResponse>(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFetchedUser(response.data.user ?? null);
      } catch (error) {
        console.error("Failed to load profile ", error);
      }
    };

    fetchUserData();
  }, [propUser]);

  // Clear saved login data, notify the parent, and go to the login page
  const handleLogout = (): void => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout?.();
    navigate("/login");
  };

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent): void => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // First letter of the name for the avatar (safe when name is empty)
  const initial: string = user?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}>
          {/* Logo */}
          <div className={navbarStyles.logoImage}>
            <img src={logo} alt="logo" />
          </div>
          <span className={navbarStyles.logoText}>Advance Expense Tracker</span>
        </div>

        {user && (
          <div className={navbarStyles.userContainer} ref={menuRef}>
            <button onClick={toggleMenu} className={navbarStyles.userButton}>
              <div className="relative">
                <div className={navbarStyles.userAvatar}>{initial}</div>
                <div className={navbarStyles.statusIndicator}></div>
              </div>
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>{user.name || "User"}</p>
                <p className={navbarStyles.userEmail}>
                  {user.email || "example@gmail.com"}
                </p>
              </div>
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>

            {/* Dropdown menu */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    <div className={navbarStyles.dropdownAvatar}>{initial}</div>
                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {user.name}
                      </div>
                      <div className={navbarStyles.dropdownEmail}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>

                <div className={navbarStyles.menuItemContainer}>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className={navbarStyles.menuItem}>
                    <UserIcon className="w-4 h-4" />
                    <span>My profile</span>
                  </button>
                </div>

                <div className={navbarStyles.menuItemBorder}>
                  <button
                    onClick={handleLogout}
                    className={navbarStyles.logoutButton}>
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
