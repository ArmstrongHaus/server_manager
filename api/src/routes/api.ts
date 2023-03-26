import express from 'express';
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
  const status = await minecraft.getStatus();
  res.send({ status });
});

export default router;
