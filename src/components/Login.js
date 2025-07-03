import { useEffect, useState } from 'react';
import * as VKID from '@vkid/sdk';

// Функция для генерации code_verifier
const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Функция для генерации code_challenge из code_verifier
const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const Login = ({ handleLoginSuccess }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeVKID = async () => {
      try {
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = await generateCodeChallenge(codeVerifier);
        localStorage.setItem('vk_code_verifier', codeVerifier); // Сохраняем code_verifier

        VKID.Config.init({
          app: 53544787,
          redirectUri: 'https://react-lime-delta.vercel.app',
          state: 'state123',
          codeChallenge, // PKCE
          codeChallengeMethod: 'S256',
          scope: 'email',
        });

        console.log('Login.js: VKID SDK инициализирован с PKCE');
      } catch (error) {
        console.error('Login.js: Ошибка инициализации VKID SDK:', error);
        setError('Ошибка инициализации VKID');
      }
    };

    initializeVKID();
  }, []);

  const handleVKIDLogin = () => {
    try {
      const oneTap = new VKID.OneTap();
      oneTap.render({
        container: document.getElementById('vkid-button-container'),
        scheme: 'light',
        lang: 'rus',
        showAlternativeLogin: true,
      })
        .on(VKID.WidgetEvents.ERROR, (error) => {
          console.error('Login.js: Ошибка VKID:', error);
          setError('Ошибка при авторизации через VKID');
        });
      console.log('Login.js: Кнопка VKID отрендерена');
    } catch (error) {
      console.error('Login.js: Ошибка создания OneTap:', error);
      setError('Ошибка инициализации кнопки VKID');
    }
  };

  // Альтернатива: Использование VKID.Auth.exchangeCode на фронтенде
  /*
  const handleVKIDLogin = () => {
    try {
      const oneTap = new VKID.OneTap();
      oneTap.render({
        container: document.getElementById('vkid-button-container'),
        scheme: 'light',
        lang: 'rus',
        showAlternativeLogin: true,
      })
        .on(VKID.WidgetEvents.ERROR, (error) => {
          console.error('Login.js: Ошибка VKID:', error);
          setError('Ошибка при авторизации через VKID');
        })
        .on(VKID.WidgetEvents.CODE, async ({ code, device_id }) => {
          console.log('Login.js: Получен code:', code, 'device_id:', device_id);
          try {
            const response = await VKID.Auth.exchangeCode(code, device_id);
            console.log('Login.js: Ответ от exchangeCode:', response);
            const { access_token, refresh_token, expires_in, user_id, id_token, scope } = response;
            localStorage.setItem('vk_access_token', access_token);
            handleLoginSuccess({ access_token, user_id });
          } catch (error) {
            console.error('Login.js: Ошибка обмена кода:', error);
            setError('Ошибка обмена кода через VKID SDK');
          }
        });
      console.log('Login.js: Кнопка VKID отрендерена');
    } catch (error) {
      console.error('Login.js: Ошибка создания OneTap:', error);
      setError('Ошибка инициализации кнопки VKID');
    }
  };
  */

  // Альтернатива: Implicit Flow (если бэкенд-обмен не работает)
  /*
  useEffect(() => {
    try {
      VKID.Config.init({
        app: 53544787,
        redirectUri: 'https://react-lime-delta.vercel.app',
        state: 'state123',
        response_type: 'token', // Implicit Flow
        scope: 'email',
      });
      console.log('Login.js: VKID SDK инициализирован для Implicit Flow');
    } catch (error) {
      console.error('Login.js: Ошибка инициализации VKID SDK:', error);
      setError('Ошибка инициализации VKID');
    }
  }, []);
  */

  return (
    <div>
      <h2>Вход через VK ID</h2>
      <div id="vkid-button-container"></div>
      <button onClick={handleVKIDLogin}>Войти через VKID</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;
