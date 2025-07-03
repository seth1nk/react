import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import vkidIcon from '../assets/img/nav-icon1.svg'; // Импорт SVG для VKID

// Константы
const APP_NAME = "VKAPITEST";
const CLIENT_ID = "53544787";
const REDIRECT_URI = "https://react-lime-delta.vercel.app";
const BACKEND_URL = "https://reactz-czkx.onrender.com"; // Новый URL бэкенда

const Login = ({ showLogin, showRegister, onLoginClose, onRegisterClose, onLoginSuccess, onRegisterSuccess, onLogout, onRegisterShow }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Загрузка VKID SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://id.vk.com/js/vkid-sdk/vkid-sdk.min.js";
    script.async = true;
    script.onload = () => {
      if (window.VKIDSDK) {
        window.VKIDSDK.init({ clientId: CLIENT_ID, redirectUri: REDIRECT_URI });
      } else {
        setError('Не удалось загрузить VKID SDK');
      }
    };
    script.onerror = () => setError('Ошибка загрузки VKID SDK');
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Проверка токена при загрузке
  useEffect(() => {
    const googleToken = localStorage.getItem('google_access_token');
    const vkToken = localStorage.getItem('vk_access_token');
    const storedUser = JSON.parse(localStorage.getItem('userInfo'));

    if (storedUser && (googleToken || vkToken)) {
      onLoginSuccess(storedUser);
      return;
    }

    if (googleToken) {
      fetch(`${BACKEND_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: googleToken }),
        credentials: 'include', // Для отправки куки
      })
        .then((res) => {
          if (!res.ok) throw new Error(`Ошибка Google: ${res.status}`);
          return res.json();
        })
        .then((userInfo) => {
          if (userInfo.email) {
            onLoginSuccess(userInfo);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } else {
            localStorage.removeItem('google_access_token');
            localStorage.removeItem('userInfo');
            onLogout();
          }
        })
        .catch((err) => {
          console.error('Ошибка проверки Google токена:', err.message);
          setError('Ошибка проверки Google токена');
        });
    } else if (vkToken) {
      fetch(`https://api.vk.com/method/users.get?access_token=${vkToken}&v=5.131&fields=first_name,last_name,photo_100`)
        .then((res) => {
          if (!res.ok) throw new Error(`Ошибка VK: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data.response && data.response.length > 0) {
            const vkUser = data.response[0];
            const userInfo = {
              name: `${vkUser.first_name} ${vkUser.last_name}`,
              picture: vkUser.photo_100,
            };
            onLoginSuccess(userInfo);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
          } else {
            localStorage.removeItem('vk_access_token');
            localStorage.removeItem('userInfo');
            onLogout();
          }
        })
        .catch((err) => {
          console.error('Ошибка проверки VKID токена:', err.message);
          setError('Ошибка проверки VKID токена');
        });
    }
  }, [onLoginSuccess, onLogout]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/login`, { email, password }, { withCredentials: true });
      localStorage.setItem('token', response.data.token);
      const userInfo = { email, name: response.data.name || email };
      onLoginSuccess(userInfo);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setError('');
      setEmail('');
      setPassword('');
      onLoginClose();
    } catch (error) {
      console.error('Ошибка входа:', error.message);
      setError(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Заполните все поля');
      return;
    }
    try {
      const response = await axios.post(`${BACKEND_URL}/register`, { email, password, name }, { withCredentials: true });
      localStorage.setItem('token', response.data.token);
      const userInfo = { email, name };
      onRegisterSuccess(userInfo);
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      setError('');
      setEmail('');
      setPassword('');
      setName('');
      onRegisterClose();
    } catch (error) {
      console.error('Ошибка регистрации:', error.message);
      setError(error.response?.data?.error || 'Ошибка регистрации');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch(`${BACKEND_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: tokenResponse.access_token }),
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`Ошибка Google: ${res.status}`);
        const userInfo = await res.json();
        if (userInfo.email) {
          onLoginSuccess(userInfo);
          localStorage.setItem('google_access_token', tokenResponse.access_token);
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
          onLoginClose();
        }
      } catch (error) {
        console.error('Ошибка входа через Google:', error.message);
        setError('Ошибка входа через Google');
      }
    },
    onError: (error) => {
      console.error('Ошибка авторизации через Google:', error);
      setError('Ошибка авторизации через Google');
    },
    scope: 'email profile',
    redirect_uri: REDIRECT_URI,
  });

  const handleVKIDLogin = () => {
    if (window.VKIDSDK) {
      const oneTapButton = new window.VKIDSDK.OneTapButton({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        appName: APP_NAME,
        scheme: window.VKIDSDK.Scheme.LIGHT,
        lang: window.VKIDSDK.Languages.RUS,
        showAlternativeLogin: true,
      });
      oneTapButton.render()
        .on(window.VKIDSDK.WidgetEvents.ERROR, (error) => {
          console.error('Ошибка VKID:', error);
          setError('Ошибка при авторизации через VKID');
        })
        .on(window.VKIDSDK.OneTapInternalEvents.LOGIN_SUCCESS, (payload) => {
          const { code, device_id } = payload;
          window.VKIDSDK.Auth.exchangeCode(code, device_id)
            .then((response) => {
              const { access_token } = response;
              localStorage.setItem('vk_access_token', access_token);
              fetch(`https://api.vk.com/method/users.get?access_token=${access_token}&v=5.131&fields=first_name,last_name,photo_100`)
                .then((res) => {
                  if (!res.ok) throw new Error(`Ошибка VK: ${res.status}`);
                  return res.json();
                })
                .then((data) => {
                  if (data.response && data.response.length > 0) {
                    const vkUser = data.response[0];
                    const userInfo = {
                      name: `${vkUser.first_name} ${vkUser.last_name}`,
                      picture: vkUser.photo_100,
                    };
                    onLoginSuccess(userInfo);
                    localStorage.setItem('userInfo', JSON.stringify(userInfo));
                    onLoginClose();
                  }
                })
                .catch((error) => {
                  console.error('Ошибка получения данных VK:', error.message);
                  setError('Ошибка получения данных пользователя');
                });
            })
            .catch((error) => {
              console.error('Ошибка обмена кода VK:', error.message);
              setError('Ошибка обмена кода на токен');
            });
        });
    } else {
      setError('VKID SDK не загружен');
    }
  };

  const handleAppleLogin = () => {
    setError('Авторизация через Apple пока не поддерживается');
  };

  const handleSwitchToRegister = () => {
    onLoginClose();
    onRegisterShow();
  };

  return (
    <>
      {showLogin && (
        <div className="modal-overlay" onClick={onLoginClose}>
          <form className="form" onSubmit={handleLoginSubmit} onClick={(e) => e.stopPropagation()}>
            {error && <div className="error-message">{error}</div>}
            <div className="flex-column">
              <label>Email</label>
            </div>
            <div className="inputForm">
              <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
                <g id="Layer_3" data-name="Layer 3">
                  <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                </g>
              </svg>
              <input
                type="email"
                className="input"
                placeholder="Введите ваш Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex-column">
              <label>Пароль</label>
            </div>
            <div className="inputForm">
              <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input
                type="password"
                className="input"
                placeholder="Введите ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
              </svg>
            </div>
            <div className="flex-row">
              <div>
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Запомнить меня</label>
              </div>
              <span className="span">Забыли пароль?</span>
            </div>
            <button className="button-submit" type="submit">
              Войти
            </button>
            <p className="p">
              Нет аккаунта?{' '}
              <span className="span" onClick={handleSwitchToRegister}>
                Зарегистрироваться
              </span>
            </p>
            <div className="flex-row">
              <button className="btn google" type="button" onClick={() => googleLogin()}>
                <svg version="1.1" width="20" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style={{ enableBackground: 'new 0 0 512 512' }} xmlSpace="preserve">
                  <path style={{ fill: '#FBBB00' }} d="M113.47,309.408L95.648,375.94l-65.139,1.378C11.042,341.211,0,299.9,0,256 c0-42.451,10.324-82.483,28.624-117.732h0.014l57.992,10.632l25.404,57.644c-5.317,15.501-8.215,32.141-8.215,49.456 C103.821,274.792,107.225,292.797,113.47,309.408z"></path>
                  <path style={{ fill: '#518EF8' }} d="M507.527,208.176C510.467,223.662,512,239.655,512,256c0,18.328-1.927,36.206-5.598,53.451 c-12.462,58.683-45.025,109.925-90.134,146.187l-0.014-0.014l-73.044-3.727l-10.338-64.535 c29.932-17.554,53.324-45.025,65.646-77.911h-136.89V208.176h138.887L507.527,208.176L507.527,208.176z"></path>
                  <path style={{ fill: '#28B446' }} d="M416.253,455.624l0.014,0.014C372.396,490.901,316.666,512,256,512 c-97.491,0-182.252-54.491-225.491-134.681l82.961-67.91c21.619,57.698,77.278,98.771,142.53,98.771 c28.047,0,54.323-7.582,76.87-20.818L416.253,455.624z"></path>
                  <path style={{ fill: '#F14336' }} d="M419.404,58.936l-82.933,67.896c-23.335-14.586-50.919-23.012-80.471-23.012 c-66.729,0-123.429,42.957-143.965,102.724l-83.397-68.276h-0.014C71.23,56.123,157.06,0,256,0 C318.115,0,375.068,22.126,419.404,58.936z"></path>
                </svg>
                Google
              </button>
              <button className="btn vkid" type="button" onClick={handleVKIDLogin}>
                <img src={vkidIcon} alt="VKID" style={{ width: '24px', height: '24px' }} />
                VKID
              </button>
            </div>
          </form>
        </div>
      )}
      {showRegister && (
        <div className="modal-overlay" onClick={onRegisterClose}>
          <form className="form" onSubmit={handleRegisterSubmit} onClick={(e) => e.stopPropagation()}>
            {error && <div className="error-message">{error}</div>}
            <div className="flex-column">
              <label>Имя</label>
            </div>
            <div className="inputForm">
              <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
                <g id="Layer_3" data-name="Layer 3">
                  <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                </g>
              </svg>
              <input
                type="text"
                className="input"
                placeholder="Введите ваше имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="flex-column">
              <label>Email</label>
            </div>
            <div className="inputForm">
              <svg height="20" viewBox="0 0 32 32" width="20" xmlns="http://www.w3.org/2000/svg">
                <g id="Layer_3" data-name="Layer 3">
                  <path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z"></path>
                </g>
              </svg>
              <input
                type="email"
                className="input"
                placeholder="Введите ваш Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex-column">
              <label>Пароль</label>
            </div>
            <div className="inputForm">
              <svg height="20" viewBox="-64 0 512 512" width="20" xmlns="http://www.w3.org/2000/svg">
                <path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0"></path>
                <path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0"></path>
              </svg>
              <input
                type="password"
                className="input"
                placeholder="Введите ваш пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <svg viewBox="0 0 576 512" height="1em" xmlns="http://www.w3.org/2000/svg">
                <path d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"></path>
              </svg>
            </div>
            <button className="button-submit" type="submit">
              Зарегистрироваться
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
