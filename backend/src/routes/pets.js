import { Router } from 'express';
import { supabase } from '../supabaseClient.js';

const router = Router();

router.get('/', async (req, res) => {
  const search = req.query.search?.toString() || '';
  const query = supabase
    .from('pets_view')
    .select('*')
    .ilike('pet_name', `%${search}%`)
    .order('pet_name');
  const { data, error } = await query;
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('pets_full_profile_view')
    .select('*')
    .eq('pet_id', id)
    .single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
});

export default router;


