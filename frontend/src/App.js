import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { IphoneProMax } from './mainpage.jsx';
import { ProfilePage } from './ProfilePage.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IphoneProMax />} />
        <Route path="/ProfilePage" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}


export default App;
