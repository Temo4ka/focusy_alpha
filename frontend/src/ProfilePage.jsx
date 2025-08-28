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
import { useAuth } from "./contexts/AuthContext";

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('');
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
    if (id === 'home') navigate('/');
    if (id === 'rating') navigate('/rating');
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleLogout = () => {
    console.log('ProfilePage: выход из учетной записи');
    logout();
    navigate('/');
  };

  const handleOpenSection = (section) => {
    // Доп. логика по разделам
  };

  return (
    <div className="app-container profile-page">
      <div className="main-container">
        {/* Header section */}
        <header className="header">
          <div className="header-content">
            <div className="header-left">
              <button className="profile-btn" onClick={handleBackClick}>
                <div className="btn-content outlined">
                  <img className="btn-icon" alt="Back" src={arrow8} />
                  <span className="btn-text">Назад</span>
                </div>
              </button>
            </div>

            <div className="logo-container">
              <img className="logo-img" alt="Logo" src={x2} />
              <h1 className="logo-title">FOCUSY</h1>
            </div>

            <div className="header-right">
              <button className="profile-btn" onClick={handleLogout}>
                <div className="btn-content outlined">
                  <span className="btn-text">Выход</span>
                </div>
              </button>
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
                <h2 className="profile-name">{user?.name || 'Гость'}</h2>
                <p className="profile-class">{user?.user_class || 'Класс не указан'}</p>
              </div>
            </div>

            <div className="stats-container">
              <div className="stat-card">
                <h3 className="stat-title">Прогресс</h3>
                <p className="stat-value">{user?.experience ?? 0} XP</p>
              </div>

              <div className="stat-card coins-card">
                <h3 className="stat-title">Монеты</h3>
                <div className="coins-value">
                  <img className="coin-icon" alt="Coin" src={image2} />
                  <p className="stat-value">{user?.coins ?? 0}</p>
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
                <h3 className="action-title">Подписка: {user?.subscribe ? 'Активна' : 'Нет'}</h3>
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