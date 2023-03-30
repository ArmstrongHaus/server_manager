import Dockerode from 'dockerode';
import { config } from '../config';
import executor from '../utils/docker-executor';
import { DockerResult, ContainerStatus } from '@shared/types/docker.types';

export class Docker {
  private docker = Dockerode();
  private _containerIds: Record<string, string> = {};

  constructor() {}

  /**
   * Get the containerId for the given container
   * @throws if not found
   * @param containerName the container name
   */
  private async getContainerId(containerName): Promise<string> {
    let containerId = this._containerIds[containerName];
    if (!containerId) {
      const cacheValue = await this.getContainerIds([containerName]);
      containerId = cacheValue[containerName];
    }
    if (!containerId) {
      throw new Error(`Container ${containerName} not found`);
    }
    return containerId;
  }

  /**
   * Get the containerIds for the containers of the given name
   * @param containerNames The names of the containers to get the IDs
   * @returns the name=>id KeyValue pair for containers to their id
   */
  private async getContainerIds(containerNames: string[]): Promise<Record<string, string>> {
    const missingIds = containerNames.filter(name => !this._containerIds.hasOwnProperty(name));
    if (missingIds) {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          name: config.CONTAINER_NAMES,
        }
      });

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

    return containerNames.reduce((ret: Record<string, string>, val: string) => {
      ret[val] = this._containerIds[val];
      return ret;
    }, {});
  }

  /**
   * Get the status of all (or one) docker container
   * @param containerName the optional containerName to get the status, if it's empty return the status of all containers
   * @returns the status info
   */
  public async getStatus(containerName?: string): Promise<DockerResult<ContainerStatus[]>> {
    let nameFilter = config.CONTAINER_NAMES;
    if (containerName !== undefined) {
      if (nameFilter.includes(containerName)) {
        nameFilter = [containerName];
      } else {
        return {
          success: false,
          error: `Container ${containerName} is not a managed container`,
        }; // Invalid container
      }
    }

    return executor(async () => {
      const containerIds = await this.getContainerIds(nameFilter);
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

      return {
        success: true,
        result: containerStatuses,
      };
    });
  }

  /**
   * Stop a docker container
   * @param containerName the container to stop
   */
  public async stopContainer(containerName): Promise<DockerResult<string>> {
    return executor(async () => {
      const containerId = await this.getContainerId(containerName);
      const container = this.docker.getContainer(containerId);
      await container.stop();
      return {
        success: true,
        result: `Container ${containerName} stopping`,
      }
    });
  }

  /**
   * Start a docker container
   * @param containerName the container to start
   */
  public async startContainer(containerName): Promise<DockerResult<string>> {
    return executor(async () => {
      const containerId = await this.getContainerId(containerName);
      const container = this.docker.getContainer(containerId);
      await container.start();
      return {
        success: true,
        result: `Container ${containerName} starting`,
      }
    });
  }

  /**
   * Run a command on a docker container and return the output
   * @param containerName the container to run the command on
   * @param command the command to run
   */
  public async runCommand(containerName: string, command: string, readLines = 1): Promise<DockerResult<string[]>> {
    return executor(async () => {
      const containerId = await this.getContainerId(containerName);
      const container = this.docker.getContainer(containerId);
      const stream = await container.attach({
        hijack: true,
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
      });

      stream.write(`${command}\n\x04`);

      const output = await new Promise<string[]>((resolve, reject) => {
        const timeout = setTimeout(() => reject('timeout'), 5000);

        let buffer = '';
        stream.on('data', (chunk: Buffer) => {
          buffer += chunk.toString();

          const lines = buffer.split(/\r?\n/);
          // First line is the command that we sent
          if (lines.length > readLines+1) {
            resolve(lines.slice(1, readLines+1));
            clearTimeout(timeout);
            stream.end();
          }
        });
        stream.on('end', () => {
          resolve(buffer.split('\n'));
          clearTimeout(timeout);
        });
        stream.on('error', (error: Error) => {
          reject(error);
          clearTimeout(timeout);
        });
      });

      return {
        success: true,
        result: output,
      };
    });
  }
}

export default new Docker();
