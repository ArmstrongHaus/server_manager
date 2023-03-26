import express from 'express';
import { getStatus } from '../services/minecraft';


const router = express.Router();

router.get('/', (req, res, next) => {
  res.send('Hello World!');
});

router.get('/status', async (req, res) => {
  const status = await getStatus('minecraft-bedrock');
  res.send({ status });
});

export default router;
