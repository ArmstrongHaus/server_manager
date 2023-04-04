export interface ContainerStatus {
  id?: string;
  name: string;
  image?: string;
  status?: string;
  state?: string;
}

export interface GroupStatus {
  [GroupName: string]: ContainerStatus[],
}

export interface DockerResult<T> {
  success: boolean,
  result?: T,
  error?: string,
}
