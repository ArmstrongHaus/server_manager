import cors from 'cors';
import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import path from 'path';

require('dotenv').config({ path: '../.env'});

import apiRouter from './routes/api';

const PORT = process.env.API_PORT || 5000;
const CLIENT_PATH = path.join(__dirname, '..', '..', 'client', 'build');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// React public files
app.use(express.static(CLIENT_PATH));

// Routes
app.use('/api', apiRouter);

// React Routes
app.use((req: Request, res: Response, next: NextFunction) => {
  res.sendFile(path.join(CLIENT_PATH, 'index.html'));
})

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
