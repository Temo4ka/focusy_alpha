import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import x2 from "./assets/2.png";
import frame56 from "./assets/frame56.svg";
import arrow8 from "./assets/arrow8.png";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import dogHouse from "./assets/dog-house.png";
import comboChart from "./assets/combo-chart.png";
import "./styles.css";

export const DifficultyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("");
  const [points, setPoints] = useState(1200);

  const header = useMemo(() => {
    const map = {
      4: { title: "ЗАДАНИЕ 4", subtitle: "Постановка ударения", progress: 60 },
      7: { title: "ЗАДАНИЕ 7", subtitle: "Морфологические нормы", progress: 30 },
      9: { title: "ЗАДАНИЕ 9", subtitle: "Правописание корней", progress: 0 },
      10: { title: "ЗАДАНИЕ 10", subtitle: "Правописание приставок", progress: 0 },
      11: { title: "ЗАДАНИЕ 11", subtitle: "Правописание суффиксов", progress: 0 },
      12: { title: "ЗАДАНИЕ 12", subtitle: "Правописание окончаний", progress: 0 },
    };
    return map[Number(id)] ?? { title: `ЗАДАНИЕ ${id}`, subtitle: "", progress: 0 };
  }, [id]);

  // Описания по заданиям
  const defaultDescriptions = {
    light: "Простые ударения в словах, которые всегда используются в речи",
    medium: "В этих словах часто ошибаются, но всё не так уж и сложно",
    hard: "Мы редко слышим эти слова. Мы всегда ошибаемся в этих словах",
  };

  const descriptionsByTask = useMemo(
    () => ({
      4: {
        light: "Простые ударения в словах, которые всегда используются в речи",
        medium: "В этих словах часто ошибаются, но всё не так уж и сложно",
        hard: "Мы редко слышим эти слова. Мы всегда ошибаемся в этих словах",
      },
      7: {
        light: "Формы слов, которые мы часто используем правильно.",
        medium: "Здесь легко запутаться, но правила знакомы.",
        hard: "Редкие формы, в которых почти всегда сомневаемся.",
      },
      9: {
        light: "Очевидные случаи, которые мы видим каждый день.",
        medium: "Похожие корни, где надо вспомнить правило.",
        hard: "Редкие корни, в которых всегда есть риск ошибки.",
      },
      10: {
        light: "Самые распространённые приставки без подвоха.",
        medium: "Приставки с нюансами, где нужно вспомнить правило.",
        hard: "Редкие приставки и сложные случаи с чередованиями.",
      },
      11: {
        light: "Привычные суффиксы, которые мы пишем без ошибок.",
        medium: "Суффиксы, где можно перепутать буквы.",
        hard: "Редкие и запутанные суффиксы, которые встречаются нечасто.",
      },
      12: {
        light: "Окончания, которые мы используем каждый день.",
        medium: "Окончания, где надо вспомнить правило.",
        hard: "Окончания в редких словах, где мы часто ошибаемся",
      },
    }),
    []
  );

  const descriptionsByLevel = descriptionsByTask[Number(id)] ?? defaultDescriptions;

  const navigationItems = [
    { id: "rating", label: "рейтинг", icon: leaderboard, iconAlt: "Leaderboard", isActive: activeNav === "rating" },
    { id: "home", label: "главная", icon: dogHouse, iconAlt: "Dog house", isActive: activeNav === "home" },
    { id: "statistics", label: "статистика", icon: comboChart, iconAlt: "Combo chart", isActive: activeNav === "statistics" },
  ];

  const handleNavClick = (nid) => {
    setActiveNav(nid);
    if (nid === "home") navigate("/");
    if (nid === "rating") navigate("/rating");
  };

  const handleProfileClick = () => navigate("/ProfilePage");
  const handleAddPointsClick = () => setPoints((p) => p + 100);

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
                <span className="btn-text">Профиль</span>
              </div>
            </button>

            <div className="points-container">
              <div className="points-display">
                <img className="points-icon" alt="Coin" src={i2} />
                <span className="points-value">{points}</span>
              </div>
              <button className="add-points-btn" onClick={handleAddPointsClick}>
                <span className="add-points-text">+</span>
              </button>
            </div>
          </div>
        </header>

        {/* Difficulty header card */}
        <section className="difficulty-header-section">
          <div className="difficulty-header-card">
            <div>
              <div className="difficulty-title">{header.title}</div>
              <div className="difficulty-subtitle">{header.subtitle}</div>
            </div>
            <div className="difficulty-progress">
              <div className="difficulty-progress-circle">{header.progress}%</div>
            </div>
          </div>
        </section>

        {/* Difficulty options */}
        <section className="difficulty-options-section">
          <div className="difficulty-prompt">Выбери уровень сложности:</div>

          <div className="difficulty-option light">
            <div className="difficulty-option-title">ЛЕГКИЙ</div>
            <div className="difficulty-option-sub">{descriptionsByLevel.light}</div>
            <div className="difficulty-option-meta">0/0</div>
            <div className="difficulty-option-arrow">→</div>
          </div>

          <div className="difficulty-option medium">
            <div className="difficulty-option-title">СРЕДНИЙ</div>
            <div className="difficulty-option-sub">{descriptionsByLevel.medium}</div>
            <div className="difficulty-option-meta">0/0</div>
            <div className="difficulty-option-arrow">→</div>
          </div>

          <div className="difficulty-option hard">
            <div className="difficulty-option-title">СЛОЖНЫЙ</div>
            <div className="difficulty-option-sub">{descriptionsByLevel.hard}</div>
            <div className="difficulty-option-meta">0/0</div>
            <div className="difficulty-option-arrow">→</div>
          </div>

          <div className="difficulty-back" style={{ width: 360 }}>
            <button className="profile-btn difficulty-back-btn" onClick={() => navigate('/tasks')}>
              <div className="btn-content outlined">
                <img className="btn-icon" alt="Back" src={arrow8} />
                <span className="btn-text">Назад</span>
              </div>
            </button>
          </div>
        </section>

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

export default DifficultyPage;

