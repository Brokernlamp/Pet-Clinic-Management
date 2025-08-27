import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { supabase } from './supabaseClient.js';
import petsRouter from './routes/pets.js';
import ownersRouter from './routes/owners.js';
import messagesRouter from './routes/messages.js';
import schedulesRouter from './routes/schedules.js';
import appointmentsRouter from './routes/appointments.js';
import ordersRouter from './routes/orders.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*'}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  const { data, error } = await supabase.from('pets').select('id').limit(1);
  if (error) return res.status(500).json({ status: 'error', error: error.message });
  return res.json({ status: 'ok', db: data ? 'connected' : 'unknown' });
});

app.use('/api/pets', petsRouter);
app.use('/api/owners', ownersRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/orders', ordersRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Backend listening on :${port}`);
});


