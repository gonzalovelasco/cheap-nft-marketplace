
// src/app.ts
import express from 'express';

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Express with TypeScript!');
});

export default app;