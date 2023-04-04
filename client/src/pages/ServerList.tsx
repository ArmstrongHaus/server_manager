import React, { useState, useEffect, useCallback } from 'react';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';

import docker from '@services/docker.service';
import ServerInfo from '@components/ServerInfo';
import { GroupStatus } from '@shared/types/docker.types';

type State<T> = React.Dispatch<React.SetStateAction<T>>;

async function getContainerStatus(setError: State<string>, setContainers: State<GroupStatus>) {
  const statusResult = await docker.getContainerStatus();
  if (statusResult.success) {
    setContainers(statusResult.result ?? {});
    setError('');
  } else {
    setContainers({});
    setError(statusResult.error ?? 'Unable to get container status');
  }
}

function ServerList() {
  const [error, setError] = useState('');
  const [containers, setContainers] = useState<GroupStatus>({});

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
    <Stack direction="vertical" gap={5}>
      {containers && Object.keys(containers).map(group => (
        <Container className="border px-0 rounded">
          <h1 className=" bg-primary text-center p-2 m-0 rounded-top">{group}</h1>
          <Stack direction="horizontal" gap={3} className="bg-light justify-content-center flex-wrap p-4">
            { containers[group].map((container, idx) => (
              <ServerInfo key={container.id ?? idx} container={container} onReload={reloadContainers} />
            ))}
          </Stack>
        </Container>
      ))}
    </Stack>
    </>
  );
}

export default ServerList;
