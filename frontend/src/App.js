import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';

function App() {
  const [generatedWords, setGeneratedWords] = useState([]);
  const [stage, setStage] = useState('overview'); // Этап: 'overview' или 'exercise'

  useEffect(() => {
    console.log('Fetching generated words from API...');
    axios.get('http://127.0.0.1:8000/api/generate_words/')
      .then(response => {
        console.log('API Response:', response.data);
        setGeneratedWords(response.data);
      })
      .catch(error => {
        console.error('Error fetching generated words:', error);
      });
  }, []);

  const startExercise = () => {
    setStage('exercise');
  };

  const handleComplete = () => {
    setStage('overview');
    // Перегенерация слов после завершения задания
    axios.get('http://127.0.0.1:8000/api/generate_words/')
      .then(response => {
        setGeneratedWords(response.data);
      })
      .catch(error => {
        console.error('Error fetching generated words:', error);
      });
  };

  return (
    <div className="App">
      <header className="App-header">
        {stage === 'overview' && (
          <>
            <h1>Список слов</h1>
            <ul>
              {generatedWords.map((word, index) => (
                <li key={index}>
                  {word.chinese_character} ({word.pinyin}): {word.translation}
                </li>
              ))}
            </ul>
            <button onClick={startExercise}>Приступить к заданию</button>
          </>
        )}

        {stage === 'exercise' && (
          <Exercise words={generatedWords} onComplete={handleComplete} />
        )}
      </header>
    </div>
  );
}

function Exercise({ words, onComplete }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [score, setScore] = useState(0);

  // Если слова ещё не загружены или массив пустой — показываем загрузку
  if (!words || words.length === 0) {
    return <div>Загрузка задания...</div>;
  }

  const currentWord = words[currentWordIndex];
  if (!currentWord) {
    return <div>Ошибка: слово не найдено.</div>;
  }

  const handleChoice = (chosenCharacter) => {
    if (chosenCharacter === currentWord.chinese_character) {
      setScore(score + 1);
    } else {
      alert('Incorrect match! Try again.');
      return;
    }

    if (currentWordIndex + 1 === words.length) {
      onComplete();
    } else {
      setCurrentWordIndex(currentWordIndex + 1);
    }
  };

  return (
    <div className="exercise">
      <h2>Сопоставь слова</h2>
      <p><strong>{currentWord.translation}</strong></p>
      <div className="choices">
        {words
          .filter(Boolean) // Убираем undefined элементы
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
