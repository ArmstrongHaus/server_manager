import { config } from "@config";
import { ContainerStatus, DockerResult } from "@shared/types/docker.types";

export class DockerService {
  private async executeRequest<T>(uri: string): Promise<any> {
    const response = await fetch(uri);
    return await response.json();
  }

  public async getContainerStatus(containerName?: string): Promise<DockerResult<ContainerStatus[]>> {
    const uri = `${config.API_URI}/status${containerName ? `?container=${containerName}` : ''}`;
    const json = await this.executeRequest(uri);
    return json.status;
  }

  public async startContainer(containerName: string): Promise<DockerResult<string>> {
    const uri = `${config.API_URI}/start/${containerName}?stopOthers`;
    const json = await this.executeRequest(uri);
    return json;
  }

  public async stopContainer(containerName: string): Promise<DockerResult<string>> {
    const uri = `${config.API_URI}/stop/${containerName}`;
    const json = await this.executeRequest(uri);
    return json;
  }

}

const instance = new DockerService();
export default instance;