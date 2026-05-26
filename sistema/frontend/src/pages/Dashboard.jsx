import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { usuario, setUsuario } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}
    setUsuario(null)
    navigate('/login')
  }

  return (
    <div>
      <h1>FarmaGestão</h1>
      <h2>Sistema de Gestão de Farmácia</h2>

      {usuario && (
        <p>
          Bem-vindo(a), <strong>{usuario.nome}</strong>!
        </p>
      )}

      <button onClick={handleLogout}>Sair do Sistema</button>

      <hr />

      <h3>Menu Principal</h3>
      <nav>
        <p>
          <Link to="/produtos">Cadastro de Medicamentos</Link>
        </p>
        <p>
          <Link to="/estoque">Movimentação de Estoque</Link>
        </p>
      </nav>
    </div>
  )
}
