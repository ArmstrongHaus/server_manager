import React from 'react';
import ContainersPage from 'src/pages/Containers';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Server Management</h1>
      </header>
      <div className="App-body">
        <ContainersPage />
      </div>
    </div>
  );
}

export default App;
