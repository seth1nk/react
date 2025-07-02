import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavBar from './components/NavBar';
import { Banner } from './components/Banner';
import { Skills } from './components/Skills';
import { Projects } from './components/Projects';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import Login from './components/Login';
import Cookie from './components/Cookie';
import { GoogleOAuthProvider, googleLogout } from '@react-oauth/google';
import { useState } from 'react';

const clientId = '412362294398-o724r7kr1klecombojvtko7dmnnnocud.apps.googleusercontent.com';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token') ||
    !!localStorage.getItem('google_access_token') ||
    !!localStorage.getItem('vk_access_token')
  );
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')) || null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginShow = () => {
    setShowLogin(true);
    setShowRegister(false); // Закрываем окно регистрации
  };

  const handleRegisterShow = () => {
    setShowRegister(true);
    setShowLogin(false); // Закрываем окно входа
  };

  const handleLoginClose = () => setShowLogin(false);
  const handleRegisterClose = () => setShowRegister(false);

  const handleLoginSuccess = (userInfo) => {
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowLogin(false);
  };

  const handleRegisterSuccess = (userInfo) => {
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowRegister(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('vk_access_token');
    localStorage.removeItem('userInfo');
    googleLogout(); // Завершаем сессию Google
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <NavBar
          onLoginShow={handleLoginShow}
          onRegisterShow={handleRegisterShow}
          isAuthenticated={isAuthenticated}
          user={user}
          onLogout={handleLogout}
        />
        <Login
          showLogin={showLogin}
          showRegister={showRegister}
          onLoginClose={handleLoginClose}
          onRegisterClose={handleRegisterClose}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          onLogout={handleLogout}
          onRegisterShow={handleRegisterShow}
        />
        <Banner />
        <Skills />
        <Projects />
        <Contact />
        <Footer />
        <Cookie />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;