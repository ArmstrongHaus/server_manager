import { config } from "@config";
import { ContainerStatus, DockerResult } from "@shared/types/docker.types";

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