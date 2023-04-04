import Dockerode from 'dockerode';
import { DockerResult, ContainerStatus } from '@shared/types/docker.types';
import { config } from '../config';
import executor from '../utils/docker-executor';

// Info that doesn't change about a container
interface ContainerCacheInfo {
  id: string,
  image: string,
  group: string,
}

export class Docker {
  private docker = Dockerode();
  private _containerCache: Record<string, ContainerCacheInfo> = {};

  constructor() {}

  /**
   * Get the containerId for the given container
   * @throws if not found
   * @param containerName the container name
   */
  private async getContainerId(containerName): Promise<string> {
    let cached = this._containerCache[containerName];
    if (!cached) {
      const cacheValue = await this.getContainerCacheInfo([containerName]);
      cached = cacheValue[containerName];
    }
    if (!cached) {
      throw new Error(`Container ${containerName} not found`);
    }
    return cached.id;
  }

  /**
   * Get the containerIds for the containers of the given name
   * @param containerNames The names of the containers to get the IDs
   * @returns the name=>id KeyValue pair for containers to their id
   */
  private async getContainerCacheInfo(containerNames: string[]): Promise<Record<string, ContainerCacheInfo>> {
    const missingIds = containerNames.filter(name => !this._containerCache.hasOwnProperty(name));
    if (missingIds) {
      const containers = await this.docker.listContainers({
        all: true,
        filters: {
          name: config.CONTAINER_NAMES,
        }
      });

      containers.forEach(c => {
        for (let fqn of c.Names) {
          const name = fqn.substring(1);
          if (config.CONTAINER_NAMES.includes(name)) {
            this._containerCache[name] = {
              id: c.Id,
              image: c.Image,
              group: config.CONTAINER_GROUP[name],
            };
          }
        }
      });
    }

    return containerNames.reduce((ret: Record<string, ContainerCacheInfo>, val: string) => {
      ret[val] = this._containerCache[val];
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
      const containerCache = await this.getContainerCacheInfo(nameFilter);
      const containerStatuses = await Promise.all(nameFilter.map(async name => {
        const cacheInfo = containerCache[name];
        const record: ContainerStatus = {
          name,
          status: undefined,
          ...cacheInfo
        };

        if (cacheInfo) {
          const containerInfo = await this.docker.getContainer(cacheInfo.id).inspect();
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
      await container.wait();
      return {
        success: true,
        result: `Container ${containerName} stopping`,
      }
    });
  }

  /**
   * Stop a container and any containers running on the same Image
   * @param containerName the container to stop with its related
   * @returns boolean
   */
  public async stopWithRelatedContainers(containerName: string): Promise<DockerResult<string>> {
    return executor(async () => {
      const containerCache = await this.getContainerCacheInfo(config.CONTAINER_NAMES);
      if (!containerCache.hasOwnProperty(containerName)) {
        throw new Error(`Container ${containerName} was not found`);
      }

      const containerGroup = config.SERVERS[containerCache[containerName].group];
      await Promise.all(containerGroup.map(async container => {
        const { id } = containerCache[container.name] ?? {};
        if (id) {
          const con = this.docker.getContainer(id);
          const info = await con.inspect();
          // If the container is running, stop it
          if (info.State.Status === 'running') {
            await con.stop();
            await con.wait();
          }
        }
      }));

      return {
        success: true,
        result: `Stopped ${containerGroup.map(c => c.name).join(',')}`,
      };
    });
  }

  /**
   * Wait until the give container is running, or error
   * @param container container to watch
   * @param tries how many polls to make, at 1s intervals
   */
  private async waitToRunning(container, tries=10): Promise<void> {
    return new Promise((accept, reject) => {
      let tryCount = 0;
      const interval = setInterval(async () => {
        const info = await container.inspect();
        if (info.State.Status === 'running') {
          clearInterval(interval);
          accept();
        }

        tryCount += 1;
        if (tryCount > tries) {
          clearInterval(interval);
          reject();
        }
      }, 1000);
    })
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
      await this.waitToRunning(container);
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
