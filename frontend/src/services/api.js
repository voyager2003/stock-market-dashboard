import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

// Attach token to every request automatically
api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem('stockUser')
      if (stored && stored !== 'undefined') {
        const user = JSON.parse(stored)
        if (user?.token) {
          config.headers['Authorization'] = `Bearer ${user.token}`
        }
      }
    } catch (err) {
      console.error('Error reading token:', err)
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 - token expired or invalid
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('stockUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  signup:     (data) => api.post('/auth/signup', data),
  login:      (data) => api.post('/auth/login', data),
  getMe:      ()     => api.get('/auth/me'),
  getAllUsers: ()     => api.get('/auth/users'),
}

export const stockAPI = {
  getQuote:   (symbol)       => api.get(`/stocks/quote/${symbol}`),
  getHistory: (symbol, days) => api.get(`/stocks/history/${symbol}?days=${days}`),
  search:     (keywords)     => api.get(`/stocks/search/${keywords}`),
}

export const watchlistAPI = {
  get:    ()       => api.get('/watchlist'),
  add:    (symbol) => api.post('/watchlist/add', { symbol }),
  remove: (symbol) => api.delete(`/watchlist/remove/${symbol}`),
}

export const transactionAPI = {
  create:       (data)             => api.post('/transactions', data),
  getMy:        ()                 => api.get('/transactions/my'),
  getAll:       ()                 => api.get('/transactions/all'),
  updateStatus: (id, status, note) => api.put(`/transactions/${id}/status`, { status, adminNote: note }),
}

export default api