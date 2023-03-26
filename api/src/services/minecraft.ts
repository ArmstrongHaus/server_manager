import { exec } from 'child_process';

export const getStatus = (containerName: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(`docker container inspect -f '{{.State.Status}}' ${containerName}`, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else if (stderr) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
