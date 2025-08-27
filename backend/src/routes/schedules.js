import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabaseClient.js';

const router = Router();

const scheduleSchema = z.object({
  messageId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
});

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('message_schedules_view')
    .select('*')
    .order('scheduled_at', { ascending: true });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { messageId, scheduledAt } = parsed.data;
  const { data, error } = await supabase
    .from('message_schedules')
    .insert({ message_id: messageId, scheduled_at: scheduledAt })
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;


