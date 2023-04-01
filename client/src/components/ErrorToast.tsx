import React from "react";
import Alert from "react-bootstrap/Alert";

interface ErrorToastProps {
  error: string
  onClose: () => void
}

const ErrorToast: React.FC<ErrorToastProps> = ({ error, onClose }) => {
  return (
    <>
      {error && (
        <Alert variant="danger">
          <i className="fa-solid fa-xmark float-end" role="button" onClick={onClose} />

          <h4>
            <i className="fa-solid fa-triangle-exclamation text-danger pe-2" />
            <strong className="me-auto">Error!</strong>
          </h4>

          {error}
        </Alert>
      )}
    </>
  );
};

export default ErrorToast;