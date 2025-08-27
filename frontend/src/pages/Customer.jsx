import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000'

export default function Customer() {
  const [petId, setPetId] = useState('')
  const [pet, setPet] = useState(null)
  const [orders, setOrders] = useState([])
  const [type, setType] = useState('checkup')
  const [notes, setNotes] = useState('')
  const [ownerId, setOwnerId] = useState('')

  useEffect(() => {
    if (!petId) return
    fetch(`${API_BASE}/api/pets/${petId}`).then(r => r.json()).then(setPet)
    fetch(`${API_BASE}/api/orders?petId=${petId}`).then(r => r.json()).then(setOrders)
  }, [petId])

  const createOrder = async () => {
    const payload = { petId, ownerId, type, notes }
    const r = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const j = await r.json()
    if (!r.ok) return alert(j.error)
    setOrders(o => [j, ...o])
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Customer Portal</h2>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="Owner ID" value={ownerId} onChange={e => setOwnerId(e.target.value)} />
        <input placeholder="Pet ID" value={petId} onChange={e => setPetId(e.target.value)} />
      </div>
      {pet && (
        <div>
          <h3>{pet.pet_name}</h3>
          <p>Appointments: see clinic for details.</p>
        </div>
      )}
      <h3>Place an Order</h3>
      <div style={{ display: 'flex', gap: 8 }}>
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="vaccine">Vaccine</option>
          <option value="checkup">Checkup</option>
          <option value="grooming">Grooming</option>
          <option value="medication_refill">Medication Refill</option>
        </select>
        <input placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
        <button onClick={createOrder}>Submit</button>
      </div>
      <h3>Order History</h3>
      <ul>
        {orders.map(o => (
          <li key={o.id}>{o.type} - {o.status} - {new Date(o.created_at).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  )
}


