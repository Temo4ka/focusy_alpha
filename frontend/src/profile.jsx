import { useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const navigate = useNavigate();

  return (
    <div className="profile-container">
      <h1>Профиль пользователя</h1>
      <p>Здесь будет информация о вашем профиле</p>
      <button onClick={() => navigate('/')}>Вернуться на главную</button>
    </div>
  );
};

