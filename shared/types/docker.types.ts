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
