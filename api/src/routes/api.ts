import express from 'express';
import docker from '../services/docker';
import minecraft from '../services/minecraft';


const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Hello World!');
});

/**
 * Get the status of the minecraft servers that are running
 * 
 * An example of the returned values
 * {
 *   "status": [{
 *     "name":"minecraft-bedrock",
 *     "id":"e6f5f5ec46932e80a6e4e77f4a6df582d02ee814a7f0807a7384410d26a9c9db",
 *     "status":"running",
 *     "state":"healthy"
 *   },{
 *     "name":"stopped-server",
 *     "id":"d89c12c9e6f187d83903d12cf731308d96dcbe1b55125cd0655153c68dd00dca",
 *     "status":"exited",
 *     "state":"unhealthy"
 *   },{
 *     "name":"server-not-found"
 *   }]
 * }
 */
router.get('/status', async (req, res) => {
  let containerName;
  if (req.query.container && typeof req.query.container === 'string') {
    containerName = req.query.container.trim();
  }

  const status = await docker.getStatus(containerName);
  res.send({ status });
});

router.get('/start/:container', async (req, res) => {
  const containerName = req.params.container.trim();
   if (req.query.stopOthers !== undefined) {
    await docker.stopWithRelatedContainers(containerName);
   }
  const result = await docker.startContainer(containerName);
  
  res.send(result);
});

router.get('/stop/:container', async (req, res) => {
  const containerName = req.params.container.trim();
  const result = await docker.stopContainer(containerName);
  
  res.send(result);
});

/**
 * Get the number of active players on a given container
 * 
 * An example of the returned values for a container with active players
 * {
 *   "count": 2
 * }
 * 
 * An example of the returned values for a container with no players
 * {
 *   "count": 0
 * }
 */
router.get('/minecraft/:container/players', async (req, res) => {
  const containerName = req.params.container.trim();
  const activePlayers = await minecraft.getActivePlayers(containerName);

  res.send(activePlayers);
});

export default router;
