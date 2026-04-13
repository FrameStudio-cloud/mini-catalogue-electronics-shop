import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">

        {/* Logo */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">
            Admin
            <span className="text-accent"> Panel</span>
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to manage your catalogue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@yourshop.com"
              className="w-full px-4 py-3 text-sm transition-colors border border-gray-200 outline-none rounded-xl focus:border-accent"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 text-sm transition-colors border border-gray-200 outline-none rounded-xl focus:border-accent"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 font-medium text-white transition-colors bg-primary hover:bg-accent rounded-xl disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

      </div>
    </div>
  )
}

export default AdminLogin