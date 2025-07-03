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
import { useState, useEffect } from 'react';

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

  // Отладка начального состояния
  useEffect(() => {
    console.log('App.js: Initial state:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  const handleLoginShow = () => {
    setShowLogin(true);
    setShowRegister(false);
    console.log('App.js: handleLoginShow called');
  };

  const handleRegisterShow = () => {
    setShowRegister(true);
    setShowLogin(false);
    console.log('App.js: handleRegisterShow called');
  };

  const handleLoginClose = () => {
    setShowLogin(false);
    console.log('App.js: handleLoginClose called');
  };

  const handleRegisterClose = () => {
    setShowRegister(false);
    console.log('App.js: handleRegisterClose called');
  };

  const handleLoginSuccess = (userInfo) => {
    console.log('App.js: handleLoginSuccess called with:', userInfo); // Отладка
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowLogin(false);
    console.log('App.js: State updated:', { isAuthenticated: true, user: userInfo });
  };

  const handleRegisterSuccess = (userInfo) => {
    console.log('App.js: handleRegisterSuccess called with:', userInfo); // Отладка
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowRegister(false);
    console.log('App.js: State updated:', { isAuthenticated: true, user: userInfo });
  };

  const handleLogout = () => {
    console.log('App.js: handleLogout called'); // Отладка
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('vk_access_token');
    localStorage.removeItem('userInfo');
    googleLogout();
    console.log('App.js: State after logout:', { isAuthenticated: false, user: null });
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
