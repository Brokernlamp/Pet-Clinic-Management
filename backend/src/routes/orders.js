import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../supabaseClient.js';

const router = Router();

const createOrderSchema = z.object({
  petId: z.string().uuid(),
  ownerId: z.string().uuid(),
  type: z.enum(['vaccine', 'checkup', 'grooming', 'medication_refill']),
  notes: z.string().optional(),
});

router.get('/', async (req, res) => {
  const petId = req.query.petId?.toString();
  let query = supabase.from('orders_view').select('*').order('created_at', { ascending: false });
  if (petId) query = query.eq('pet_id', petId);
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.post('/', async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { petId, ownerId, type, notes } = parsed.data;
  const { data, error } = await supabase
    .from('orders')
    .insert({ pet_id: petId, owner_id: ownerId, type, notes: notes ?? null, status: 'pending' })
    .select('*')
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

export default router;


