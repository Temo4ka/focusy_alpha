import './styles.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { IphoneProMax } from './mainpage.jsx';
import { ProfilePage } from './ProfilePage.jsx';
import { RatingPage } from './RatingPage.jsx';
import { TasksSelectionPage } from './TasksSelectionPage.jsx';
import { DifficultyPage } from './DifficultyPage.jsx';
import { SubscribePage } from './SubscribePage.jsx';
import TestIntegration from './TestIntegration.jsx';
import QuickLogin from './QuickLogin.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
                    <Routes>
              <Route path="/" element={<IphoneProMax />} />
              <Route path="/home" element={<IphoneProMax />} />
              <Route path="/login" element={<QuickLogin />} />
              <Route path="/ProfilePage" element={<ProfilePage />} />
              <Route path="/rating" element={<RatingPage />} />
              <Route path="/tasks" element={<TasksSelectionPage />} />
              <Route path="/difficulty/:id" element={<DifficultyPage />} />
              <Route path="/subscribe" element={<SubscribePage />} />
              <Route path="/test-integration" element={<TestIntegration />} />
            </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
