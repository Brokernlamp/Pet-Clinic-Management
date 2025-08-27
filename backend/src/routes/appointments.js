import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabaseClient.js';

const router = Router();

const appointmentSchema = z.object({
  petId: z.string().uuid(),
  ownerId: z.string().uuid(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  reason: z.string().min(1),
  treatment: z.string().optional(),
});

router.get('/', async (req, res) => {
  const petId = req.query.petId?.toString();
  let query = supabase.from('appointments_view').select('*').order('starts_at', { ascending: true });
  if (petId) query = query.eq('pet_id', petId);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const parsed = appointmentSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { petId, ownerId, startsAt, endsAt, reason, treatment } = parsed.data;
  const { data, error } = await supabase
    .from('appointments')
    .insert({ pet_id: petId, owner_id: ownerId, starts_at: startsAt, ends_at: endsAt, reason, treatment: treatment ?? null })
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;


