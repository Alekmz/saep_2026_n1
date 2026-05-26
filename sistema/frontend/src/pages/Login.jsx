import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { usuario, setUsuario, loading } = useAuth()
  const navigate = useNavigate()

  if (!loading && usuario) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: login.trim(), senha })
      })
      const data = await res.json()

      if (res.ok) {
        setUsuario(data.usuario)
        navigate('/')
      } else {
        setErro(data.error || 'Erro ao fazer login.')
        setSenha('')
      }
    } catch {
      setErro('Erro de conexão com o servidor.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div>
      <h1>FarmaGestão</h1>
      <h2>Sistema de Gestão de Farmácia</h2>

      <h3>Acesso ao Sistema</h3>

      {erro && (
        <p style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
          {erro}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login">Login:</label>
          <br />
          <input
            id="login"
            type="text"
            value={login}
            onChange={e => setLogin(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <br />
        <div>
          <label htmlFor="senha">Senha:</label>
          <br />
          <input
            id="senha"
            type="password"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <br />
        <button type="submit" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p>
        <small>Usuários de teste: ana / 123456 &nbsp;|&nbsp; bruno / 123456 &nbsp;|&nbsp; carla / 123456</small>
      </p>
    </div>
  )
}
