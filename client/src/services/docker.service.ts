import { config } from "@config";

export class DockerService {
  constructor() {}

  public async getServerStatus(containerName?: string): Promise<string> {
    return 'test';
  }
}

export default new DockerService();