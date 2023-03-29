import docker, { Docker } from './docker';

export interface ActivePlayers {
  count: number;
}

export class Minecraft {
  constructor(private docker: Docker) {}

  public async getActivePlayers(containerName: string): Promise<ActivePlayers> {
    const result: ActivePlayers = {
      count: 0,
    };

    try {
      const lines = await this.docker.runCommand(containerName, 'list', 1);
      // send "list" over stdin
      // stdout:
      // There are 1/10 players online:
      // AdaK93

      if (lines && lines.length > 0) {
        const playerRegex = /There are (\d+)\/(\d+) players online/;
        const match = lines[0].match(playerRegex);
        if (match) {
          result.count = parseInt(match[1]);
        }
      }
    } catch (error) {
      console.error(`Failed to get active players:`, error);
    }

    return result;
  }
}

export default new Minecraft(docker);
