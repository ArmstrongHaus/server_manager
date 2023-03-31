import React, { useState, useEffect } from 'react';
import docker from '@services/docker.service';
import ContainerInfo from '@components/ContainerInfo';
import './Containers.css';
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

function Containers() {
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<ContainerStatus[]>([]);

  useEffect(() => {
    getContainerStatus(setError, setContainers);
  }, [setError, setContainers]);

  return (
    <div className="container-list">
      {containers && containers.map((container, idx) => (
        <ContainerInfo container={container} key={container.id ?? idx} />
      ))}
      {error && (
        <div className="error">{error}</div>
      )}
    </div>
  );
}

export default Containers;
