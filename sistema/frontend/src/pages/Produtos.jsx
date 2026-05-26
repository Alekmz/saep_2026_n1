import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CAMPOS_VAZIOS = {
  nome: '',
  categoria: '',
  fabricante: '',
  principio_ativo: '',
  preco: '',
  estoque_atual: '',
  estoque_minimo: ''
}

function validar(campos) {
  if (!campos.nome.trim()) return 'Nome do medicamento é obrigatório.'
  if (!campos.categoria.trim()) return 'Categoria é obrigatória.'
  if (!campos.fabricante.trim()) return 'Fabricante é obrigatório.'
  if (!campos.principio_ativo.trim()) return 'Princípio ativo é obrigatório.'
  if (campos.preco === '' || isNaN(Number(campos.preco)) || Number(campos.preco) < 0)
    return 'Preço deve ser um número válido e não negativo.'
  if (
    campos.estoque_atual === '' ||
    isNaN(Number(campos.estoque_atual)) ||
    !Number.isInteger(Number(campos.estoque_atual)) ||
    Number(campos.estoque_atual) < 0
  )
    return 'Estoque atual deve ser um número inteiro não negativo.'
  if (
    campos.estoque_minimo === '' ||
    isNaN(Number(campos.estoque_minimo)) ||
    !Number.isInteger(Number(campos.estoque_minimo)) ||
    Number(campos.estoque_minimo) < 0
  )
    return 'Estoque mínimo deve ser um número inteiro não negativo.'
  return null
}

export default function Produtos() {
  const [produtos, setProdutos] = useState([])
  const [busca, setBusca] = useState('')
  const [formAberto, setFormAberto] = useState(false)
  const [editandoId, setEditandoId] = useState(null)
  const [campos, setCampos] = useState(CAMPOS_VAZIOS)
  const [mensagem, setMensagem] = useState({ texto: '', cor: 'black' })
  const [erroForm, setErroForm] = useState('')
  const { setUsuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    carregarProdutos()
  }, [])

  function campo(key) {
    return e => setCampos(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function carregarProdutos(termo = '') {
    const url = termo.trim()
      ? `/api/produtos?busca=${encodeURIComponent(termo.trim())}`
      : '/api/produtos'
    const res = await fetch(url)
    if (res.status === 401) { setUsuario(null); navigate('/login'); return }
    if (res.ok) setProdutos(await res.json())
  }

  function mostrarMensagem(texto, cor = 'green') {
    setMensagem({ texto, cor })
    setTimeout(() => setMensagem({ texto: '', cor: 'black' }), 5000)
  }

  function abrirNovo() {
    setCampos(CAMPOS_VAZIOS)
    setEditandoId(null)
    setErroForm('')
    setFormAberto(true)
  }

  async function abrirEdicao(id) {
    const res = await fetch(`/api/produtos/${id}`)
    if (!res.ok) { mostrarMensagem('Erro ao carregar medicamento.', 'red'); return }
    const p = await res.json()
    setCampos({
      nome: p.nome,
      categoria: p.categoria,
      fabricante: p.fabricante,
      principio_ativo: p.principio_ativo,
      preco: p.preco,
      estoque_atual: p.estoque_atual,
      estoque_minimo: p.estoque_minimo
    })
    setEditandoId(id)
    setErroForm('')
    setFormAberto(true)
  }

  function fecharForm() {
    setFormAberto(false)
    setEditandoId(null)
    setCampos(CAMPOS_VAZIOS)
    setErroForm('')
  }

  async function salvar() {
    const erroMsg = validar(campos)
    if (erroMsg) { setErroForm(erroMsg); return }
    setErroForm('')

    const payload = {
      nome: campos.nome.trim(),
      categoria: campos.categoria.trim(),
      fabricante: campos.fabricante.trim(),
      principio_ativo: campos.principio_ativo.trim(),
      preco: Number(campos.preco),
      estoque_atual: Number(campos.estoque_atual),
      estoque_minimo: Number(campos.estoque_minimo)
    }

    const url = editandoId ? `/api/produtos/${editandoId}` : '/api/produtos'
    const method = editandoId ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const data = await res.json()

    if (res.ok) {
      mostrarMensagem(data.message)
      fecharForm()
      carregarProdutos(busca)
    } else {
      setErroForm(data.error || 'Erro ao salvar medicamento.')
    }
  }

  async function excluir(id, nome) {
    if (!window.confirm(`Confirmar exclusão do medicamento:\n${nome}?`)) return
    const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' })
    const data = await res.json()
    if (res.ok) {
      mostrarMensagem(data.message)
      carregarProdutos(busca)
    } else {
      mostrarMensagem(data.error || 'Erro ao excluir.', 'red')
    }
  }

  return (
    <div>
      <h1>FarmaGestão</h1>
      <h2>Cadastro de Medicamentos</h2>
      <Link to="/">← Voltar ao Menu Principal</Link>
      <hr />

      <h3>Buscar Medicamento</h3>
      <input
        type="text"
        value={busca}
        onChange={e => setBusca(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && carregarProdutos(busca)}
        placeholder="Buscar por nome, categoria, fabricante ou princípio ativo..."
      />
      <button onClick={() => carregarProdutos(busca)}>Buscar</button>
      <button onClick={() => { setBusca(''); carregarProdutos() }}>Limpar</button>

      <hr />

      <h3>Lista de Medicamentos</h3>
      <button onClick={abrirNovo}>+ Cadastrar Novo Medicamento</button>

      {mensagem.texto && (
        <p style={{ color: mensagem.cor, fontWeight: 'bold' }}>{mensagem.texto}</p>
      )}

      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Fabricante</th>
            <th>Princípio Ativo</th>
            <th>Preço (R$)</th>
            <th>Estoque Atual</th>
            <th>Estoque Mínimo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 ? (
            <tr>
              <td colSpan="9">Nenhum medicamento encontrado.</td>
            </tr>
          ) : (
            produtos.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.nome}</td>
                <td>{p.categoria}</td>
                <td>{p.fabricante}</td>
                <td>{p.principio_ativo}</td>
                <td>{Number(p.preco).toFixed(2)}</td>
                <td>{p.estoque_atual}</td>
                <td>{p.estoque_minimo}</td>
                <td>
                  <button onClick={() => abrirEdicao(p.id)}>Editar</button>{' '}
                  <button onClick={() => excluir(p.id, p.nome)}>Excluir</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <hr />

      {formAberto && (
        <div style={{ border: '1px solid black', padding: '16px' }}>
          <h3>{editandoId ? 'Editar Medicamento' : 'Cadastrar Novo Medicamento'}</h3>

          {erroForm && <p style={{ color: 'red' }}>{erroForm}</p>}

          <div>
            <label>
              Nome do Medicamento: *
              <br />
              <input value={campos.nome} onChange={campo('nome')} />
            </label>
          </div>
          <br />
          <div>
            <label>
              Categoria: *
              <br />
              <input
                value={campos.categoria}
                onChange={campo('categoria')}
                placeholder="Ex: Analgésico, Antibiótico, Anti-inflamatório..."
              />
            </label>
          </div>
          <br />
          <div>
            <label>
              Fabricante: *
              <br />
              <input value={campos.fabricante} onChange={campo('fabricante')} />
            </label>
          </div>
          <br />
          <div>
            <label>
              Princípio Ativo: *
              <br />
              <input value={campos.principio_ativo} onChange={campo('principio_ativo')} />
            </label>
          </div>
          <br />
          <div>
            <label>
              Preço (R$): *
              <br />
              <input
                type="number"
                step="0.01"
                min="0"
                value={campos.preco}
                onChange={campo('preco')}
              />
            </label>
          </div>
          <br />
          <div>
            <label>
              Estoque Atual (unidades): *
              <br />
              <input
                type="number"
                step="1"
                min="0"
                value={campos.estoque_atual}
                onChange={campo('estoque_atual')}
              />
            </label>
          </div>
          <br />
          <div>
            <label>
              Estoque Mínimo (unidades): *
              <br />
              <input
                type="number"
                step="1"
                min="0"
                value={campos.estoque_minimo}
                onChange={campo('estoque_minimo')}
              />
            </label>
          </div>
          <br />
          <button onClick={salvar}>Salvar</button>{' '}
          <button onClick={fecharForm}>Cancelar</button>
        </div>
      )}
    </div>
  )
}
