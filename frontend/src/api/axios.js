import axios from 'axios'

export const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const KEY = 'aso.token'

export const auth = {
  token: () => localStorage.getItem(KEY),
  set: (t) => localStorage.setItem(KEY, t),
  clear: () => localStorage.removeItem(KEY),
}

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = auth.token()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      auth.clear()
      if (location.pathname !== '/login') location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api