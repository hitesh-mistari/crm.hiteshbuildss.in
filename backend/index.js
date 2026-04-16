import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSchema } from './config/schema.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());

app.use('/api', apiRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

initSchema()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`FounderOS API server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize schema:', err);
    process.exit(1);
  });
