import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabaseClient.js';

const router = Router();

const composeSchema = z.object({
  ownerId: z.string().uuid(),
  petId: z.string().uuid().optional(),
  template: z.string().min(1),
  placeholders: z.record(z.string()).default({}),
  scheduleAt: z.string().datetime().optional(),
});

router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('id, owner_id, pet_id, body, status, scheduled_at, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/compose', async (req, res) => {
  const parsed = composeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { ownerId, petId, template, placeholders, scheduleAt } = parsed.data;

  const body = template.replace(/{{\s*(\w+)\s*}}/g, (_m, key) => placeholders[key] ?? '');

  const payload = {
    owner_id: ownerId,
    pet_id: petId ?? null,
    body,
    status: scheduleAt ? 'scheduled' : 'posted',
    scheduled_at: scheduleAt ?? null,
  };

  const { data, error } = await supabase.from('messages').insert(payload).select('*').single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;


