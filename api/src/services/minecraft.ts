import { exec } from 'child_process';
import { config } from '../config';
import Docker from 'dockerode';

export interface ContainerStatus {
  id?: string;
  name: string;
  status?: string;
  state?: string;
}

export class Minecraft {
  private docker = Docker();
  private _containerIds: Record<string, string>;

  constructor() {}

  private async getContainerIds(): Promise<Record<string, string>> {
    if (!this._containerIds) {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          name: config.CONTAINER_NAMES,
        }
      });

      this._containerIds = {};
      containers.forEach(c => {
        const containerId = c.Id;
        for (let fqn of c.Names) {
          const name = fqn.substring(1);
          if (config.CONTAINER_NAMES.includes(name)) {
            this._containerIds[name] = containerId;
          }
        }
      });
    }
    return this._containerIds;
  }
  
  public async getStatus(containerName?: string): Promise<ContainerStatus[]> {
    let nameFilter = config.CONTAINER_NAMES;
    if (containerName && nameFilter.includes(containerName)) {
      nameFilter = [containerName];
    }

    const containerIds = await this.getContainerIds();
    const containerStatuses = await Promise.all(nameFilter.map(async name => {
      const containerId = containerIds[name];
      const record: ContainerStatus = {
        name,
        id: containerId,
        status: undefined,
      };

      if (containerId) {
        const containerInfo = await this.docker.getContainer(containerId).inspect();
        record.status = containerInfo.State.Status;
        record.state = containerInfo.State.Health.Status;
      }

      return record;
    }));

    return containerStatuses;
  }
}

export default new Minecraft();

// TODO use something like the below code to get how many users are currently
// active on a given server
async function runDockerCommand(containerId: string): Promise<string> {
  const docker = new Docker();
  const container = docker.getContainer(containerId);

  await container.start();

  const attachOpts = {
    stream: true,
    stdin: true,
    stdout: true,
    stderr: true,
  };

  const stream = await container.attach(attachOpts);

  stream.write('list\n'); // send "list" over stdin
  // stoud:
  // There are 1/10 players online:
  // AdaK93

  const chunks: Buffer[] = [];

  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    stream.on('end', () => {
      const output = Buffer.concat(chunks).toString();
      resolve(output);
    });

    stream.on('error', (error: Error) => {
      reject(error);
    });

    container.detach();
  });
}
