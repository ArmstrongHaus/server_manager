import { config } from "src/config";

export interface ContainerStatus {
  id?: string;
  name: string;
  status?: string;
  state?: string;
}

export interface DockerResult<T> {
  success: boolean,
  result?: T,
  error?: string,
}

export class DockerService {
  public async getContainerStatus(containerName?: string): Promise<DockerResult<ContainerStatus[]>> {
    const uri = `${config.API_URI}/status${containerName ? `?container=${containerName}` : ''}`;
    const response = await fetch(uri);
    const json = await response.json();
    return json.status;
  }
}

const instance = new DockerService();
export default instance;