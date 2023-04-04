import fs from 'fs';
import path from 'path';
import { GroupStatus } from './types/docker.types';

const configDir = process.env.CONFIG_DIR || './config';
const configPath = configDir[0] === '/'
  ? configDir
  : path.join(__dirname, '../..', configDir);
const configFile = path.join(configPath, 'config.json');

const rawConfigData = fs.readFileSync(configFile);
const configData = JSON.parse(rawConfigData.toString());

export interface ContainerConfig {
  name: string
}

export interface ServersConfig {
  [key: string]: ContainerConfig[]
}

const SERVERS = configData.servers as ServersConfig;

export type config = {
  SERVERS: ServersConfig,
  CONTAINER_GROUP: {[server_name: string]: string},
  CONTAINER_NAMES: string[],
}

export const config: config = {
  SERVERS,
  CONTAINER_GROUP: Object.entries(SERVERS)
    .flatMap(([groupKey, group]) => group.map((server => [server.name, groupKey])))
    .reduce((nameMap, [name, groupKey]) => ({ ...nameMap, [name]: groupKey }), {}),
  CONTAINER_NAMES: Object.values(SERVERS)
    .flatMap(group => group.map(server => server.name))
};
