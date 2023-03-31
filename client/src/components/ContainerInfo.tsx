import { ContainerStatus } from "@shared/types/docker.types";
import React from "react";
import "./ContainerInfo.css";

interface Props {
  container: ContainerStatus
}

const ServerInfo: React.FC<Props> = ({ container }) => {
  return (
    <div className="container">
      <h3>{container.name}</h3>
      <div>{container.status}</div>
    </div>
  );
};

export default ServerInfo;