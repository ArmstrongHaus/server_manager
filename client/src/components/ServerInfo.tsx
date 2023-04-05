import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Modal from "react-bootstrap/Modal";
import { ButtonVariant } from "react-bootstrap/esm/types";

import { ContainerStatus } from "@shared/types/docker.types";
import docker from "@services/docker.service";
import ErrorToast from "@components/ErrorToast";

interface ServerTogglerProps {
  variant: ButtonVariant
  toggleText: string
  confirmText: string
  onToggle: () => Promise<void>
}

const ServerToggler: React.FC<ServerTogglerProps> = ({ variant, toggleText, confirmText, onToggle }) => {
  const [isLoading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  
  const handleToggleClick = () => setShowConfirm(true);
  const handleConfirmCancel = () => setShowConfirm(false);
  const handleConfirmSuccess = async () => {
    setLoading(true);
    try {
      await onToggle();
      setShowConfirm(false);
    } catch (error: any) {
      setError(error.toString());
    }
    setLoading(false);
  };

  // Clear our error if we close the modal or make a request
  useEffect(() => {
    if (!showConfirm || isLoading) {
      setError('');
    }
  }, [showConfirm, isLoading, setError]);
  
  return (
    <>
      <Button
        variant={variant}
        disabled={showConfirm}
        onClick={!showConfirm ? handleToggleClick : undefined}
        >
          {toggleText}
      </Button>

      <Modal show={showConfirm} onHide={isLoading ? undefined : handleConfirmCancel}>
        <Modal.Header>
          <span>
            <Modal.Title>
              Are you sure?
            </Modal.Title>
          </span>
        </Modal.Header>
        <Modal.Body>
          <ErrorToast onClose={() => setError('')} error={error} />
          {confirmText}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            disabled={isLoading}
            onClick={isLoading ? undefined : handleConfirmCancel}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={isLoading}
            onClick={isLoading ? undefined : handleConfirmSuccess}
          >
            {isLoading ? "Working..." : "Proceed"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

interface ServerInfoBodyProps {
  status?: string
  name: string
  onReload: () => void
}

const ServerInfoBody: React.FC<ServerInfoBodyProps> = ({ name, status, onReload }) => {
  if (status === undefined) {
    return (
      <Card.Text className="text-center">Server Not Found</Card.Text>
    );
  }

  const onToggle = async () => {
    if (status === 'exited') {
      await docker.startContainer(name);
    } else {
      await docker.stopContainer(name);
    }
    onReload();
  };

  if (status === 'exited') {
    // If currently stopped, then allow to start
    return (
      <ServerToggler
        variant="success"
        toggleText="Start Server"
        confirmText="This will stop all other server in this group"
        onToggle={onToggle}
      />
    )
  }

  // Default stop the server
  return (
    <ServerToggler
      variant="danger"
      toggleText="Stop Server"
      confirmText="This will kick any active players and may not save data properly"
      onToggle={onToggle}
    />
  )
};

interface ServerInfoProps {
  container: ContainerStatus
  onReload: () => void
}

const ServerInfo: React.FC<ServerInfoProps> = ({ container, onReload }) => {
  const { status } = container;

  let iconClasses: string = '';
  if (status === 'running') {
    // iconClasses = 'fa-square-check text-success';
  } else if (status === 'exited') {
    // iconClasses = 'fa-square-xmark text-danger';
  } else {
    iconClasses = 'fa-triangle-exclamation text-warning';
  }

  return (
    <Card className="col-lg-3 col-md-4 col-5 align-middle">
      <Card.Title className="d-flex bg-secondary text-light rounded-top p-2 m-0">
        {iconClasses && <i className={`fa-solid ${iconClasses} align-self-center pe-2`} />}
        {container.name}
      </Card.Title>
      <Card.Body className="d-flex flex-column">
        <ServerInfoBody name={container.name} status={status} onReload={onReload} />
      </Card.Body>
    </Card>
  );
};

export default ServerInfo;