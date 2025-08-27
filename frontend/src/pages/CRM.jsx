import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

function SearchBar({ onSearch }) {
  const [q, setQ] = useState('')
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search pets or owners" />
      <button onClick={() => onSearch(q)}>Search</button>
    </div>
  )
}

function List({ title, items, render }) {
  return (
    <div>
      <h3>{title}</h3>
      <ul>
        {items.map(render)}
      </ul>
    </div>
  )
}

function PetDetail({ petId }) {
  const [pet, setPet] = useState(null)
  useEffect(() => {
    fetch(`${API_BASE}/api/pets/${petId}`).then(r => r.json()).then(setPet)
  }, [petId])
  if (!pet) return <div>Loading...</div>
  return (
    <div>
      <h2>{pet.pet_name}</h2>
      <p>Owner: {pet.owner_full_name}</p>
      <h4>Medical History</h4>
      <pre>{pet.medical_history_json}</pre>
      <h4>Messages</h4>
      <pre>{pet.messages_json}</pre>
    </div>
  )
}

function Composer() {
  const [ownerId, setOwnerId] = useState('')
  const [petId, setPetId] = useState('')
  const [template, setTemplate] = useState('Hello {{owner}}, this is a reminder for {{pet}}.')
  const [placeholders, setPlaceholders] = useState({ owner: '', pet: '' })
  const [scheduleAt, setScheduleAt] = useState('')

  const payload = useMemo(() => ({ ownerId, petId: petId || undefined, template, placeholders, scheduleAt: scheduleAt || undefined }), [ownerId, petId, template, placeholders, scheduleAt])

  const send = async () => {
    const r = await fetch(`${API_BASE}/api/messages/compose`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await r.json()
    alert(r.ok ? 'Message saved' : `Error: ${j.error}`)
  }
  return (
    <div>
      <h3>Compose Message</h3>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: '1fr 1fr' }}>
        <input placeholder="Owner ID" value={ownerId} onChange={e => setOwnerId(e.target.value)} />
        <input placeholder="Pet ID (optional)" value={petId} onChange={e => setPetId(e.target.value)} />
        <textarea placeholder="Template" value={template} onChange={e => setTemplate(e.target.value)} />
        <input placeholder="Placeholder: owner" value={placeholders.owner} onChange={e => setPlaceholders(p => ({ ...p, owner: e.target.value }))} />
        <input placeholder="Placeholder: pet" value={placeholders.pet} onChange={e => setPlaceholders(p => ({ ...p, pet: e.target.value }))} />
        <input type="datetime-local" value={scheduleAt} onChange={e => setScheduleAt(e.target.value)} />
      </div>
      <button onClick={send}>Post / Schedule</button>
    </div>
  )
}

export default function CRM() {
  const [pets, setPets] = useState([])
  const [owners, setOwners] = useState([])

  const search = async (q) => {
    const [p, o] = await Promise.all([
      fetch(`${API_BASE}/api/pets?search=${encodeURIComponent(q)}`).then(r => r.json()),
      fetch(`${API_BASE}/api/owners?search=${encodeURIComponent(q)}`).then(r => r.json()),
    ])
    setPets(p)
    setOwners(o)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100vh' }}>
      <div style={{ padding: 16, borderRight: '1px solid #eee' }}>
        <h2>CRM</h2>
        <SearchBar onSearch={search} />
        <List title="Pets" items={pets} render={p => (
          <li key={p.pet_id}><Link to={`pet/${p.pet_id}`}>{p.pet_name}</Link></li>
        )} />
        <List title="Owners" items={owners} render={o => (
          <li key={o.id}>{o.full_name}</li>
        )} />
      </div>
      <div style={{ padding: 16, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<Composer />} />
          <Route path="pet/:id" element={<PetRoute />} />
        </Routes>
      </div>
    </div>
  )
}

function PetRoute() {
  const id = location.pathname.split('/').pop()
  return <PetDetail petId={id} />
}


