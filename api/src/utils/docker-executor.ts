import { DockerResult } from "@shared/types/docker.types";

export default async function dockerExecutor<T>(handler: () => Promise<DockerResult<T>>) {
  try {
    return await handler();
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: err.toString(),
    };
  }
}