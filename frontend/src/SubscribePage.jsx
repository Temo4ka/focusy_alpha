import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import x2 from "./assets/2.png";
import frame56 from "./assets/frame56.svg";
import i2 from "./assets/i2.png";
import leaderboard from "./assets/leaderboard.png";
import dogHouse from "./assets/dog-house.png";
import comboChart from "./assets/combo-chart.png";
import "./styles.css";

const FeatureIcon = ({ name }) => {
  const candidates = useMemo(() => {
    const map = {
      solve: ["/Book_and_Pencil.png", "/Book_and_Pencil.svg", "/Book_and_Pencil.jpg"],
      choose: ["/Books.png", "/Books.svg", "/Books.jpg"],
      bonus: ["/Star.png", "/Star.svg", "/Star.jpg"],
      compete: ["/Trophy.png", "/Trophy.svg", "/Trophy.jpg"],
    };
    return map[name] || [];
  }, [name]);

  const [idx, setIdx] = useState(0);
  const src = candidates[idx];
  if (!src) return null;
  return (
    <img
      className="subscribe-feature-icon"
      src={src}
      alt={name}
      onError={() => setIdx((i) => i + 1)}
    />
  );
};

const ArrowIcon = ({ className }) => {
  const candidates = ["/arrow.png", "/arrow.svg", "/arrow.jpg"];
  const [idx, setIdx] = useState(0);
  const src = candidates[idx];
  return (
    <img className={className} src={src} alt="arrow" onError={() => setIdx((i) => i + 1)} />
  );
};

export const SubscribePage = () => {
  const [activeNav, setActiveNav] = useState("");
  const [points, setPoints] = useState(1200);
  const [selectedPlan, setSelectedPlan] = useState("6m");
  const navigate = useNavigate();

  const navigationItems = [
    { id: "rating", label: "рейтинг", icon: leaderboard, iconAlt: "Leaderboard", isActive: false },
    { id: "home", label: "главная", icon: dogHouse, iconAlt: "Dog house", isActive: false },
    { id: "statistics", label: "статистика", icon: comboChart, iconAlt: "Combo chart", isActive: false },
  ];

  const handleNavClick = (id) => {
    setActiveNav(id);
    if (id === "home") navigate("/");
    if (id === "rating") navigate("/rating");
  };

  const handleProfileClick = () => navigate("/ProfilePage");
  const handleAddPointsClick = () => setPoints((p) => p + 100);

  const features = [
    { key: "solve", text: "Нарешивай задания сколько хочешь" },
    { key: "choose", text: "Выбирай любой предмет" },
    { key: "bonus", text: "Получай дополнительные задания и призы" },
    { key: "compete", text: "Участвуй в общем соревновании" },
  ];

  const plans = [
    { id: "6m", title: "6 месяцев", price: "2190 ₽", monthly: "365₽/мес" },
    { id: "3m", title: "3 месяца", price: "1199 ₽", monthly: "399₽/мес" },
    { id: "1m", title: "1 месяц", price: "450 ₽", monthly: null },
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

        {/* Title and features */}
        <section className="subscribe-section">
          <h2 className="subscribe-title">ПОДПИСКА</h2>
          <ul className="subscribe-features">
            {features.map((f) => (
              <li key={f.key} className="subscribe-feature">
                <FeatureIcon name={f.key} />
                <span className="subscribe-feature-text">{f.text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Plans */}
        <section className="subscribe-plans">
          {plans.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlan(p.id)}
              className={`subscribe-plan ${selectedPlan === p.id ? "active" : ""}`}
            >
              <div className="subscribe-plan-left">
                <div className="subscribe-plan-title">{p.title}</div>
                {p.monthly && <div className="subscribe-plan-monthly">{p.monthly}</div>}
              </div>
              <div className="subscribe-plan-right">
                <div className="subscribe-plan-price">{p.price}</div>
                <ArrowIcon className="subscribe-plan-arrow" />
              </div>
            </div>
          ))}
        </section>

        {/* Final subscribe CTA button */}
        <div className="subscribe-final">
          <button type="button" className="subscribe-final-btn">
            Оформить подписку
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

export default SubscribePage;

