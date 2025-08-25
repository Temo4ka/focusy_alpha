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
import { useAuth } from "./contexts/AuthContext";

export const IphoneProMax = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeNav, setActiveNav] = useState('home');
  const navigate = useNavigate();

  const userName = user?.name || "Гость";
  const coins = user?.coins ?? 0;
  const isSubscribed = Boolean(user?.subscribe);

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
      publicImage: "/subjects/russian/icon.png",
      imageAlt: "Rectangle",
    },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === 'home') navigate('/');
    if (id === 'rating') navigate('/rating');
    if (id === 'statistics') console.log('Открыть статистику');
  };

  const handleProfileClick = () => {
    navigate('/ProfilePage');
  };

  const handleSubjectClick = (subjectId) => {
    navigate('/tasks');
  };

  const goSubscribe = () => {
    navigate('/subscribe');
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
              <div className="btn-content outlined">
                <img className="btn-icon" alt="Frame" src={frame56} />
                <span className="btn-text">{isAuthenticated ? userName : "Профиль"}</span>
              </div>
            </button>

            <div className="points-container">
              <div className="points-display">
                <img className="points-icon" alt="I" src={i2} />
                <span className="points-value">{coins}</span>
              </div>
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
              <div className="progress-label">Подписка:</div>
              <div className="progress-value">{isSubscribed ? 'Активна' : 'Нет'}</div>
            </div>

            <div className="xp-circle">
              <img className="xp-circle-img" alt="Ellipse" src={ellipse188} />
              <div className="xp-value">{(user?.experience ?? 0)} XP</div>
            </div>

            <div className="level-text">Ступень {(user?.level ?? 1)}</div>
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
                  src={subject.publicImage || subject.image}
                  onError={(e) => {
                    e.currentTarget.src = subject.image;
                  }}
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
        <div className="subscribe-cta">
          <button className="subscribe-cta-btn" onClick={goSubscribe}>
            Оформить подписку
            <img className="subscribe-arrow" alt="arrow" src={"/arrow.png"} onError={(e)=>{e.currentTarget.src='/arrow.svg'}} />
          </button>
        </div>
      </div>
    </div>
  );
};