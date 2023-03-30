import React, { useState, useEffect } from 'react';
import { config } from '@config';
import docker from '@services/docker.service';

function Servers() {
  const [servers, setServers] = useState('');

  useEffect(() => {
    (async () => {
      const servers = await docker.getServerStatus();
      setServers(servers);
    })();
  })

  return (
    <div className="App">
      <header className="App-header">
        <p>
          {config.API_URI}
        </p><p>
          {servers ?? 'Loading...'}
        </p>
      </header>
    </div>
  );
}

export default Servers;
