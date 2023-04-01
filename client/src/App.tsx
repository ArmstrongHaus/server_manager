import React from 'react';
import ServersList from '@pages/ServerList';
import Container from 'react-bootstrap/Container';

function App() {
  return (
    <Container className="p-3">
      <Container className="p-5 mb-4 bg-dark rounded-3">
        <h1 className="header text-center text-light">
          Server Manager
        </h1>
      </Container>
      <ServersList />
    </Container>
  );
}

export default App;
