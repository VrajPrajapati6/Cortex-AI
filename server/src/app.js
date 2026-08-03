import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware.js';
import { handleChat } from './controllers/chat.controller.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Cortex Telemetry Backend Running' });
});

app.post('/api/chat', handleChat);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
