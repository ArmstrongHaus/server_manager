import React, { useState, useEffect } from 'react';
import { config } from '@config';
import ServersPage from '@pages/servers';
import './App.css';

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
        <h1>Server Management</h1>
      </header>
      <body>
        <ServersPage />
      </body>
    </div>
  );
}

export default App;
