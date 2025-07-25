import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { IphoneProMax } from './mainpage.jsx';
import { ProfilePage } from './profile.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IphoneProMax />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}


export default App;
