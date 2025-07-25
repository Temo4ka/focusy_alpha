import React, { useState } from "react";
import x2 from "./assets/2.png";
import { useNavigate } from "react-router-dom";
import comboChart from "./assets/combo-chart.png";
import dogHouse from "./assets/dog-house.png";
import ellipse188 from "./assets/ellipse188.svg";
import frame56 from "./assets/frame56.svg";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import rectangle188 from "./assets/rectangle188.png";
import "./styles.css";

export const IphoneProMax = () => {
  const [activeNav, setActiveNav] = useState('home');
  const [points, setPoints] = useState(1200);
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: "rating",
      label: "рейтинг",
      icon: leaderboard,
      iconAlt: "Leaderboard",
      isActive: activeNav === 'rating',
    },
    {
      id: "home",
      label: "главная",
      icon: dogHouse,
      iconAlt: "Dog house",
      isActive: activeNav === 'home',
    },
    {
      id: "statistics",
      label: "статистика",
      icon: comboChart,
      iconAlt: "Combo chart",
      isActive: activeNav === 'statistics',
    },
  ];

  const subjects = [
    {
      id: "russian",
      title: "РУССКИЙ ЯЗЫК",
      description: "Решай задания с 4 по 20 \nи получай очки опыта",
      image: rectangle188,
      imageAlt: "Rectangle",
    },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    console.log(`Переход на: ${id}`);
    // Здесь можно добавить логику перехода между страницами
  };

  const handleProfileClick = () => {
    console.log("Открытие профиля");
    // Логика открытия профиля
    navigate('/profile');
  };

  const handleAddPointsClick = () => {
    const newPoints = points + 100;
    setPoints(newPoints);
    console.log("Добавлено 100 монет");
  };

  const handleSubjectClick = (subjectId) => {
    console.log(`Выбран предмет: ${subjectId}`);
    // Логика открытия предмета
  };

  return (
    <div className="app-container">
      <div className="main-container">
        {/* Header section */}
        <header className="header">
          <div className="header-content">
            <div className="logo-container">
              <img className="logo-img" alt="Element" src={x2} />
              <h1 className="logo-title">FOCUSY</h1>
            </div>

            <button className="profile-btn" onClick={handleProfileClick}>
              <div className="btn-content">
                <img className="btn-icon" alt="Frame" src={frame56} />
                <span className="btn-text">Профиль</span>
              </div>
            </button>

            <div className="points-container">
              <div className="points-display">
                <img className="points-icon" alt="I" src={i2} />
                <span className="points-value">{points}</span>
              </div>
              <button className="add-points-btn" onClick={handleAddPointsClick}>
                <span className="add-points-text">+</span>
              </button>
            </div>
          </div>
        </header>

        {/* Tasks section */}
        <section className="tasks-section">
          <div className="tasks-container">
            <div className="tasks-header">
              <h2 className="tasks-title">ТВОИ ЗАДАЧИ</h2>
            </div>

            <div className="progress-container">
              <div className="progress-label">Выполнено:</div>
              <div className="progress-bg"></div>
              <div className="progress-fill"></div>
              <div className="progress-value">75%</div>
            </div>

            <div className="xp-circle">
              <img className="xp-circle-img" alt="Ellipse" src={ellipse188} />
              <div className="xp-value">750 XP</div>
            </div>

            <div className="level-text">Ступень 1</div>
          </div>
        </section>

        {/* Subjects section */}
        <section className="subjects-section">
          <div className="subjects-container">
            <h2 className="subjects-title">ПРЕДМЕТЫ</h2>

            {subjects.map((subject) => (
              <div 
                key={subject.id} 
                className="subject-card"
                onClick={() => handleSubjectClick(subject.id)}
              >
                <img
                  className="subject-image"
                  alt={subject.imageAlt}
                  src={subject.image}
                />
                <h3 className="subject-name">{subject.title}</h3>
                <p className="subject-description">
                  {subject.description.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index < subject.description.split("\n").length - 1 && (
                        <br />
                      )}
                    </React.Fragment>
                  ))}
                </p>
              </div>
            ))}

            <p className="new-subjects-text">
              Скоро здесь появятся новые предметы
            </p>
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