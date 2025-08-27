import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

router.get('/', async (req, res) => {
  const search = req.query.search?.toString() || '';
  const { data, error } = await supabase
    .from('owners')
    .select('id, full_name, phone, email')
    .ilike('full_name', `%${search}%`)
    .order('full_name');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('owner_profiles_view')
    .select('*')
    .eq('owner_id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

export default router;


