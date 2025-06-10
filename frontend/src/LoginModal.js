import React, { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const url = isRegister
      ? 'http://127.0.0.1:8000/api/register/'
      : 'http://127.0.0.1:8000/api/login/';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister
          ? { email, password, username: email }
          : { email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        // Получаем пользователя сразу после входа
        const userRes = await fetch('http://127.0.0.1:8000/api/me/', {
          headers: { Authorization: `Token ${data.token}` },
        });
        const userData = await userRes.json();
        onLoginSuccess(userData);
        onClose();
      } else {
        setError(data.non_field_errors?.[0] || 'Ошибка');
      }
    } catch {
      setError('Ошибка сети');
    }
  };

  return (
    <div className="login-modal-backdrop">
      <div className="login-modal">
        <button className="login-modal-close" onClick={onClose}>×</button>
        <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Почта"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isRegister ? 'Зарегистрироваться' : 'Войти'}</button>
        </form>
        <button
          className="login-modal-toggle"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
        </button>
        {error && <div className="login-modal-error">{error}</div>}
      </div>
    </div>
  );
}