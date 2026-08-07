import { Server } from 'socket.io';
import { getMlStatus, getMlPrediction } from '../workers/mlInferenceWorker.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Immediately send current ML status & prediction on connect
    try {
      socket.emit('ml_status', getMlStatus());
      const pred = getMlPrediction();
      if (pred) {
        socket.emit('ml_prediction', pred);
      }
    } catch (e) {
      // Worker might not have started yet
    }

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};
