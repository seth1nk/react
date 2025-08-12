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
const BACKEND_URL = 'https://reactz-czkx.onrender.com';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token') ||
    !!localStorage.getItem('google_access_token') ||
    !!localStorage.getItem('vk_access_token')
  );
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('userInfo')) || null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    console.log('App.js: Initial state:', { isAuthenticated, user });
  }, [isAuthenticated, user]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state === 'state123') {
      // Очистка URL сразу, чтобы избежать повторных запросов
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('App.js: Обнаружен code из VKID:', code);
      fetch(`${BACKEND_URL}/auth/vkid/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Ошибка VK: ${res.status}`);
          return res.json();
        })
        .then((response) => {
          console.log('App.js: Ответ от /auth/vkid/token:', response);
          if (response.error) {
            throw new Error(`Ошибка VK API: ${response.error} - ${response.details}`);
          }
          const { access_token } = response;
          if (!access_token) throw new Error('access_token не получен');
          localStorage.setItem('vk_access_token', access_token);
          return fetch(
            `https://api.vk.com/method/users.get?access_token=${access_token}&v=5.199&fields=first_name,last_name,photo_100`
          );
        })
        .then((res) => {
          if (!res.ok) throw new Error(`Ошибка VK API: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          console.log('App.js: Данные пользователя VK:', data);
          if (data.response && data.response.length > 0) {
            const vkUser = data.response[0];
            const userInfo = {
              name: `${vkUser.first_name} ${vkUser.last_name}`,
              picture: vkUser.photo_100,
            };
            handleLoginSuccess(userInfo);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } else {
            throw new Error('Данные пользователя не получены');
          }
        })
        .catch((error) => {
          console.error('App.js: Ошибка обработки VKID:', error.message);
        });
    }
  }, []);

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
    console.log('App.js: handleLoginSuccess called with:', userInfo);
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowLogin(false);
    console.log('App.js: State updated:', { isAuthenticated: true, user: userInfo });
  };

  const handleRegisterSuccess = (userInfo) => {
    console.log('App.js: handleRegisterSuccess called with:', userInfo);
    setIsAuthenticated(true);
    setUser(userInfo);
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    setShowRegister(false);
    console.log('App.js: State updated:', { isAuthenticated: true, user: userInfo });
  };

  const handleLogout = () => {
    console.log('App.js: handleLogout called');
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
