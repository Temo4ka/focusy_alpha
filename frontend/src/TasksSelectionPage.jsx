import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import x2 from "./assets/2.png";
import frame56 from "./assets/frame56.svg";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import dogHouse from "./assets/dog-house.png";
import comboChart from "./assets/combo-chart.png";
import "./styles.css";
import arrow8 from "./assets/arrow8.png";
import { useAuth } from "./contexts/AuthContext";

const TaskIcon = ({ folder, fallbackText }) => {
  const candidates = useMemo(
    () => [
      `/${folder}/icon.png`,
      `/${folder}/icon.jpg`,
      `/${folder}/image.png`,
      `/${folder}/image.jpg`,
      `/${folder}/1.png`,
      `/${folder}/1.jpg`,
    ],
    [folder]
  );

  const [srcIdx, setSrcIdx] = useState(0);
  const src = candidates[srcIdx];

  if (!src) {
    return <div className="taskselect-icon-fallback">{fallbackText}</div>;
  }

  return (
    <img
      className="taskselect-icon-img"
      src={src}
      alt={folder}
      onError={() => setSrcIdx((i) => i + 1)}
    />
  );
};

export const TasksSelectionPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeNav, setActiveNav] = useState("");
  const navigate = useNavigate();

  const navigationItems = [
    { id: "rating", label: "рейтинг", icon: leaderboard, iconAlt: "Leaderboard", isActive: activeNav === "rating" },
    { id: "home", label: "главная", icon: dogHouse, iconAlt: "Dog house", isActive: activeNav === "home" },
    { id: "statistics", label: "статистика", icon: comboChart, iconAlt: "Combo chart", isActive: activeNav === "statistics" },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === "home") navigate("/");
    if (id === "rating") navigate("/rating");
  };

  const handleProfileClick = () => navigate("/ProfilePage");

  const tasks = [
    { id: 4, folder: "Ex_4", title: "Задание 4", subtitle: "Постановка ударения", iconText: "Á", progress: 60, color: "#4CAF50" },
    { id: 7, folder: "Ex_7", title: "Задание 7", subtitle: "Морфологические нормы", iconText: "OB", progress: 30, color: "#C2B900" },
    { id: 9, folder: "Ex_9", title: "Задание 9", subtitle: "Правописание корней", iconText: "~", progress: 0, color: "#E34B4B" },
    { id: 10, folder: "Ex_10", title: "Задание 10", subtitle: "Правописание приставок", iconText: "[]", progress: 0, color: "#E34B4B" },
    { id: 11, folder: "Ex_11", title: "Задание 11", subtitle: "Правописание суффиксов", iconText: "^", progress: 0, color: "#E34B4B" },
    { id: 12, folder: "Ex_12", title: "Задание 12", subtitle: "Правописание окончаний", iconText: "■", progress: 0, color: "#E34B4B" },
  ];

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

        {/* Tasks list section */}
        <section className="taskselect-section">
          <div className="taskselect-container">
            <h2 className="taskselect-title">ЗАДАНИЯ</h2>

            <div className="taskselect-list">
              {tasks.map((t) => (
                <div key={t.id} className="taskselect-item" onClick={() => navigate(`/difficulty/${t.id}`)}>
                  <div className="taskselect-icon">
                    <TaskIcon folder={t.folder} fallbackText={t.iconText} />
                  </div>
                  <div className="taskselect-texts">
                    <div className="taskselect-task">{t.title}</div>
                    <div className="taskselect-sub">{t.subtitle}</div>
                  </div>
                  <div className="taskselect-progress" style={{ color: t.color }}>{t.progress}%</div>
                </div>
              ))}
            </div>

            <p className="taskselect-footer">Скоро здесь появятся новые задания</p>
          </div>
        </section>

        {/* Back button below tasks */}
        <div className="taskselect-back" style={{ width: 360 }}>
          <button className="profile-btn difficulty-back-btn" onClick={() => navigate('/') }>
            <div className="btn-content outlined">
              <img className="btn-icon" alt="Back" src={arrow8} />
              <span className="btn-text">Назад</span>
            </div>
          </button>
        </div>

        {/* Bottom navigation */}
        <nav className="navigation">
          <div className="nav-container">
            {navigationItems.map((item) => (
              <div
                key={item.id}
                className={`nav-item ${item.id} ${item.isActive ? "active" : ""}`}
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

export default TasksSelectionPage;

