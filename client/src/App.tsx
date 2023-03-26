import React, { useState, useEffect } from 'react';
import { config } from './config';
import logo from './logo.svg';
import './App.css';

console.log(process.env);

function App() {
  const [data, setData] = useState('');

  useEffect(() => {
    (async () => {
      const response = await fetch(config.API_URI);
      const text = await response.text();
      setData(text);
    })();
  })

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {config.API_URI}
        </p><p>
          {data ?? 'Loading...'}
        </p>
      </header>
    </div>
  );
}

export default App;
