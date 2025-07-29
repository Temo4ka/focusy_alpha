import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import x2 from "./assets/2.png";
import arrow8 from "./assets/arrow8.png";
import arrow9 from "./assets/arrow9.png";
import comboChart from "./assets/combo-chart.png";
import dogHouse from "./assets/dog-house.png";
import image2 from "./assets/i2.png";
import image from "./assets/image.png";
import leaderboard from "./assets/leaderboard.png";
import "./styles.css";

export const ProfilePage = () => {
  const [activeNav, setActiveNav] = useState('home');
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

  const handleNavClick = (id) => {
    setActiveNav(id);
    console.log(`Переход на: ${id}`);
    if (id === 'home') {
      navigate('/');
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleOpenSection = (section) => {
    console.log(`Открытие раздела: ${section}`);
    // Здесь можно добавить логику открытия соответствующих разделов
  };

  return (
    <div className="app-container">
      <div className="main-container">
        {/* Header section */}
        <header className="header">
          <div className="header-content">
            <button className="profile-btn" onClick={handleBackClick}>
              <div className="btn-content">
                <img className="btn-icon" alt="Back" src={arrow8} />
                <span className="btn-text">Назад</span>
              </div>
            </button>

            <div className="logo-container">
              <img className="logo-img" alt="Logo" src={x2} />
              <h1 className="logo-title">FOCUSY</h1>
            </div>
          </div>
        </header>

        {/* Profile section */}
        <section className="profile-section">
          <div className="profile-container">
            <div className="profile-info">
              <div className="profile-image-container">
                <img className="profile-image" alt="Profile" src={image} />
              </div>
              <div className="profile-details">
                <h2 className="profile-name">Иванова Ольга</h2>
                <p className="profile-class">11 класс</p>
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-card">
                <h3 className="stat-title">Прогресс</h3>
                <p className="stat-value">750 XP</p>
              </div>

              <div className="stat-card coins-card">
                <h3 className="stat-title">Монеты</h3>
                <div className="coins-value">
                  <img className="coin-icon" alt="Coin" src={image2} />
                  <p className="stat-value">1200</p>
                </div>
              </div>
            </div>

            <div className="profile-actions">
              <div className="action-card" onClick={() => handleOpenSection('errors')}>
                <h3 className="action-title">Мои ошибки</h3>
                <div className="action-button">
                  <span className="action-text">Открыть</span>
                  <img className="action-arrow" alt="Arrow" src={arrow9} />
                </div>
              </div>

              <div className="action-card" onClick={() => handleOpenSection('materials')}>
                <h3 className="action-title">Мои полезные материалы</h3>
                <div className="action-button">
                  <span className="action-text">Открыть</span>
                  <img className="action-arrow" alt="Arrow" src={arrow9} />
                </div>
              </div>

              <div className="action-card" onClick={() => handleOpenSection('subscription')}>
                <h3 className="action-title">Подписка активна до: 23.03.26</h3>
                <div className="action-button">
                  <span className="action-text">Управлять подпиской</span>
                  <img className="action-arrow" alt="Arrow" src={arrow9} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom navigation */}
        <nav className="navigation">
          <div className="nav-container">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${item.id} ${item.isActive ? "active" : ""}`}
                onClick={() => handleNavClick(item.id)}
              >
                <img className="nav-icon" alt={item.iconAlt} src={item.icon} />
                <span className="nav-label">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};