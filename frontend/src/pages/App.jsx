import { Link } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, Arial', padding: 24 }}>
      <h1>Pet Clinic</h1>
      <p>Select a portal:</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/crm">Clinic Staff CRM</Link>
        <Link to="/customer">Customer Portal</Link>
      </div>
    </div>
  )
}


