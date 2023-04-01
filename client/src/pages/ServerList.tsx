import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';
import Stack from 'react-bootstrap/Stack';

import docker from '@services/docker.service';
import ServerInfo from '@components/ServerInfo';
import { ContainerStatus } from '@shared/types/docker.types';

type State<T> = React.Dispatch<React.SetStateAction<T>>;

async function getContainerStatus(setError: State<string>, setContainers: State<ContainerStatus[]>) {
  const statusResult = await docker.getContainerStatus();
  if (statusResult.success) {
    setContainers(statusResult.result ?? []);
    setError('');
  } else {
    setContainers([]);
    setError(statusResult.error ?? 'Unable to get container status');
  }
}

function ServerList() {
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<ContainerStatus[]>([]);

  const reloadContainers = useCallback(() => {
    getContainerStatus(setError, setContainers);
  }, [setError, setContainers]);

  useEffect(() => {
    reloadContainers();
  }, []);

  return (
    <>
    {error && (
      <Alert variant="danger">
        {error}
      </Alert>
    )}
    {containers && (
      <Stack direction="horizontal" gap={3} className="justify-content-center flex-wrap">
        { containers.map((container, idx) => (
          <ServerInfo key={container.id ?? idx} container={container} onReload={reloadContainers} />
        ))}
      </Stack>
    )}
    </>
  );
}

export default ServerList;
