import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Sidebar from './Sidebar';
import LoginModal from './LoginModal';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import useAuth from "./useAuth";

function App() {
  const { user, setUser } = useAuth();
  const [generatedWords, setGeneratedWords] = useState([]);
  const [stage, setStage] = useState('overview');
  const [activeTab, setActiveTab] = useState('home');
  const [showLogin, setShowLogin] = useState(false);

  const [achievements, setAchievements] = useState([]);
  const [points, setPoints] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const [allAchievements, setAllAchievements] = useState([]);

  const fetchWords = () => {
    return axios.get('http://127.0.0.1:8000/api/generate_words/')
      .then(response => response.data)
      .catch(error => {
        console.error('Error fetching generated words:', error);
        return [];
      });
  };

  useEffect(() => {
    fetchWords().then(words => setGeneratedWords(words));
  }, []);

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      axios.get('http://127.0.0.1:8000/api/my_achievements/', {
        headers: { Authorization: `Token ${token}` }
      }).then(res => setAchievements(res.data));

      axios.get('http://127.0.0.1:8000/api/my_points/', {
        headers: { Authorization: `Token ${token}` }
      }).then(res => setPoints(res.data.points));

      axios.get('http://127.0.0.1:8000/api/all_achievements/', {
        headers: { Authorization: `Token ${token}` }
      }).then(res => setAllAchievements(res.data));
    }
  }, [user]);

  const startExercise = () => setStage('exercise');
  const reloadAchievements = () => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('http://127.0.0.1:8000/api/my_achievements/', {
        headers: { Authorization: `Token ${token}` }
      }).then(res => setAchievements(res.data));

      axios.get('http://127.0.0.1:8000/api/my_points/', {
        headers: { Authorization: `Token ${token}` }
      }).then(res => setPoints(res.data.points));
    }
  };

  const handleComplete = (score) => {
    setStage('overview');
    const token = localStorage.getItem('token');
    if (!token) return;

    const grant = (name) => {
      const ach = allAchievements.find(a => a.name === name);
      if (ach) {
        return fetch('http://127.0.0.1:8000/api/grant_achievement/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`
          },
          body: JSON.stringify({ achievement_id: ach.id })
        })
        .then(res => res.json())
        .then(data => {
          console.log(`Достижение "${name}" (${ach.id}) попытка выдачи:`, data);
          return data;
        });
      }
      return Promise.resolve();
    };

    const promises = [];
    if (score >= 1) promises.push(grant("Первое правильное слово"));
    if (score >= 5) promises.push(grant("5 правильных слов подряд"));
    if (score >= 10) promises.push(grant("10 правильных слов"));

    Promise.all(promises).then(reloadAchievements);
  };

  const grantAchievements = (score) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const grant = (name) => {
      const ach = allAchievements.find(a => a.name === name);
      if (ach) {
        return fetch('http://127.0.0.1:8000/api/grant_achievement/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Token ${token}`
          },
          body: JSON.stringify({ achievement_id: ach.id })
        })
        .then(res => res.json())
        .then(data => {
          console.log(`Достижение "${name}" (${ach.id}) попытка выдачи:`, data);
          return data;
        });
      }
      return Promise.resolve();
    };

    const promises = [];
    if (score >= 1) promises.push(grant("Первое правильное слово"));
    if (score >= 5) promises.push(grant("5 правильных слов подряд"));
    if (score >= 10) promises.push(grant("10 правильных слов"));

    Promise.all(promises).then(reloadAchievements);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  let content;
  if (activeTab === 'home') {
    content = (
      <div className="centered-content">
        <div className="welcome-block">
          <h1>Добро пожаловать в ShenMao!</h1>
          <p>Изучайте китайский язык вместе с котиками 🐾</p>
        </div>
      </div>
    );
  } else if (activeTab === 'profile') {
    content = (
      <div className="centered-content">
        <div className="profile-block">
          <h1>Профиль котика</h1>
          <div style={{ fontSize: '5rem', margin: '20px' }}>😺</div>
          <p>Почта: {user ? user.email : "—"}</p>
          <p>Очки: {points}</p>
        </div>
      </div>
    );
  } else if (activeTab === 'lesson') {
    content = (
      <div className="centered-content">
        <div className="word-list-block">
          {stage === 'overview' && (
            <>
              <h1>Урок</h1>
              <button onClick={startExercise}>Приступить к заданию</button>
            </>
          )}
          {stage === 'exercise' && (
            <Exercise
              words={generatedWords}
              fetchWords={fetchWords}
              onComplete={handleComplete}
              totalScore={totalScore}
              setTotalScore={setTotalScore}
              grantAchievements={grantAchievements}
            />
          )}
        </div>
      </div>
    );
  } else if (activeTab === 'achievements') {
    content = (
      <div className="centered-content">
        <div className="App-header">
          <h1>Достижения</h1>
          <ul>
            {allAchievements.length === 0 && <li>Пока нет достижений</li>}
            {allAchievements.map((ach, idx) => {
              const earned = achievements.some(ua => ua.achievement.id === ach.id);
              return (
                <li key={ach.id} style={{ opacity: earned ? 1 : 0.5 }}>
                  <b>{ach.name}</b> — {ach.description} <span style={{color:'#c2185b'}}>+{ach.points} очков</span>
                  {earned && <span style={{marginLeft: 8, color: '#4caf50'}}>✔</span>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="site-header">
        <div className="site-header-title">
          <span role="img" aria-label="cat" className="site-header-logo">🐾</span>
          <span className="site-header-text">ShenMao</span>
        </div>
        <div className="paw-track">
          {[...Array(7)].map((_, i) => (
            <span
              key={i}
              className="paw-sticker"
              style={{ animationDelay: `${0.3 + i * 0.25}s` }}
            >🐾</span>
          ))}
        </div>
        {/* ...остальной header... */}
      </header>
      <div className="main-content">
        <Sidebar
          active={activeTab}
          onSelect={setActiveTab}
          onLogin={() => setShowLogin(true)}
          user={user}
          onLogout={handleLogout}
        />
        {content}
        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLoginSuccess={setUser}
          />
        )}
      </div>
    </div>
  );
}

function Exercise({ words, fetchWords, onComplete, totalScore, setTotalScore, grantAchievements }) {
  const [currentWords, setCurrentWords] = useState(words);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [preview, setPreview] = useState(true);

  useEffect(() => {
    setCurrentWords(words);
    setCurrentWordIndex(0);
    setWaitingForNext(false);
    setPreview(true); // Показываем предпросмотр при запуске и после каждого нового набора
  }, [words]);

  if (!currentWords || currentWords.length === 0) {
    return <div>Загрузка задания...</div>;
  }

  const currentWord = currentWords[currentWordIndex];
  if (!currentWord) {
    return <div>Ошибка: слово не найдено.</div>;
  }

  const handleChoice = async (chosenCharacter) => {
    if (waitingForNext || preview) return;

    if (chosenCharacter === currentWord.chinese_character) {
      setTotalScore(totalScore + 1);
      setScore(score + 1);
    } else {
      alert('Incorrect match! Try again.');
      return;
    }

    if (currentWordIndex + 1 === currentWords.length) {
      // После завершения набора — проверяем достижения
      grantAchievements(totalScore + 1);
      setWaitingForNext(true);
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  const handleNextSet = async () => {
    const newWords = await fetchWords();
    if (newWords && newWords.length > 0) {
      setCurrentWords(newWords);
      setCurrentWordIndex(0);
      setWaitingForNext(false);
      setPreview(true); // Показываем предпросмотр нового набора
    } else {
      onComplete(score);
    }
  };

  const handleStart = () => {
    setPreview(false);
  };

  return (
    <div className="exercise">
      <h2>Сопоставь слова</h2>
      {waitingForNext ? (
        <div>
          <p>Набор завершён!</p>
          <button className="choice-button" onClick={handleNextSet}>
            Следующий набор
          </button>
        </div>
      ) : preview ? (
        <div>
          <p>Запомните слова:</p>
          <ul>
            {currentWords.map((word, idx) => (
              <li key={idx}>
                <b>{word.chinese_character}</b> — {word.translation} ({word.pinyin})
              </li>
            ))}
          </ul>
          <button className="choice-button" onClick={handleStart}>
            Начать
          </button>
        </div>
      ) : (
        <>
          <p><strong>{currentWord.translation}</strong></p>
          <div className="choices">
            {currentWords
              .filter(Boolean)
              .map((word) => ({ ...word, randomOrder: Math.random() }))
              .sort((a, b) => a.randomOrder - b.randomOrder)
              .map((word) => (
                <button
                  key={word.chinese_character}
                  onClick={() => handleChoice(word.chinese_character)}
                  className="choice-button"
                >
                  {word.chinese_character}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

function DraggableWord({ word }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: word.chinese_character,
    data: { current: word },
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="word-item">
      {word.chinese_character}
    </div>
  );
}

function DroppableTranslation({ word }) {
  const { setNodeRef, isOver } = useDroppable({
    id: word.translation,
    data: { current: word },
  });

  const style = {
    border: isOver ? '2px solid green' : '2px dashed gray',
    padding: '10px',
    margin: '5px',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isOver ? '#e0ffe0' : '#f9f9f9',
    color: '#333', 
    fontWeight: 'bold', 
    fontSize: '16px', 
  };

  return (
    <div ref={setNodeRef} style={style} className="translation-item">
      {word.translation}
    </div>
  );
}

export default App;
