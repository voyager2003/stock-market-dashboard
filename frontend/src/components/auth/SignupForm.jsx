import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { authAPI } from '../../services/api'

export default function SignupForm() {
  const [form, setForm]       = useState({ username: '', email: '', password: '', role: 'user' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const { login }             = useAuth()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authAPI.signup(form)
      login(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Username</label>
        <input name="username" value={form.username} onChange={handleChange} required placeholder="johndoe" />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
      </div>
      <div className="form-group">
        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}