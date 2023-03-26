const { exec } = require('child_process');

const getStatus = (containerName) => {
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
