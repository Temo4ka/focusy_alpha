import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import x2 from "./assets/2.png";
import frame56 from "./assets/frame56.svg";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import dogHouse from "./assets/dog-house.png";
import comboChart from "./assets/combo-chart.png";
import studentSleep from "./assets/rectangle188.png"; // fallback if provided image missing
import "./styles.css";
import { useAuth } from "./contexts/AuthContext";

// Image served from public folder so the app doesn't break if file isn't present yet
// Use absolute path from public folder (expects file: frontend/public/rating-octo/rating-octo.png)
const mascotPublicPath = "/rating-octo/rating-octo.png";

export const RatingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeNav, setActiveNav] = useState("rating");
  const [mascotSrc, setMascotSrc] = useState(mascotPublicPath);
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: "rating",
      label: "рейтинг",
      icon: leaderboard,
      iconAlt: "Leaderboard",
      isActive: activeNav === "rating",
    },
    {
      id: "home",
      label: "главная",
      icon: dogHouse,
      iconAlt: "Dog house",
      isActive: activeNav === "home",
    },
    {
      id: "statistics",
      label: "статистика",
      icon: comboChart,
      iconAlt: "Combo chart",
      isActive: activeNav === "statistics",
    },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === "home") navigate("/");
    if (id === "statistics") console.log("Открыть статистику");
  };

  const handleProfileClick = () => {
    navigate("/ProfilePage");
  };

  return (
    <div className="app-container">
      <div className="main-container">
        {/* Header */}
        <header className="header">
          <div className="header-content">
            <div className="logo-container">
              <img className="logo-img" alt="Logo" src={x2} />
              <h1 className="logo-title">FOCUSY</h1>
            </div>

            <button className="profile-btn" onClick={handleProfileClick}>
              <div className="btn-content outlined">
                <img className="btn-icon" alt="Profile" src={frame56} />
                <span className="btn-text">{isAuthenticated ? (user?.name || 'Профиль') : 'Профиль'}</span>
              </div>
            </button>

            <div className="points-container">
              <div className="points-display">
                <img className="points-icon" alt="Coin" src={i2} />
                <span className="points-value">{user?.coins ?? 0}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Rating info card */}
        <section className="rating-section">
          <div className="rating-card">
            <h2 className="rating-title">Что такое рейтинг?</h2>
            <p className="rating-paragraph">
              Мы уверены, что ты играл в игры, где есть рейтинговая система
            </p>
            <p className="rating-paragraph">Совсем скоро она будет и у нас</p>

            <h3 className="rating-subtitle">Что это дает?</h3>
            <ul className="rating-list">
              <li>
                Конечно, ты сможешь говорить всем, что ты первый в рейтинговой
                таблице
              </li>
              <li>
                Ты получишь очки опыта и будешь прокачивать свой уровень
              </li>
              <li>
                За призовые места в рейтинге ты получишь награды, которые потом
                обменяешь на призы
              </li>
            </ul>
          </div>
          <div className="rating-mascot">
            <img
              src={mascotSrc}
              alt="Mascot"
              className="rating-mascot-img"
              onError={(e) => {
                // Fallback chain: folder path -> root public file -> local placeholder
                if (mascotSrc === "/rating-octo/rating-octo.png") {
                  setMascotSrc("/rating-octo.png");
                } else {
                  setMascotSrc(studentSleep);
                }
              }}
            />
          </div>
        </section>

        {/* Bottom navigation */}
        <nav className="navigation">
          <div className="nav-container">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${item.id} ${
                  item.isActive ? "active" : ""
                }`}
                onClick={() => handleNavClick(item.id)}
              >
                <img className="nav-icon" alt={item.iconAlt} src={item.icon} />
                <span className="nav-label">{item.label}</span>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default RatingPage;


