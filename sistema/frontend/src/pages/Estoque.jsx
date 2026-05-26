import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Bubble sort para ordenação alfabética por nome do medicamento
function bubbleSort(arr) {
  const sorted = [...arr]
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = 0; j < sorted.length - 1 - i; j++) {
      if (sorted[j].nome.localeCompare(sorted[j + 1].nome, 'pt-BR') > 0) {
        const temp = sorted[j]
        sorted[j] = sorted[j + 1]
        sorted[j + 1] = temp
      }
    }
  }
  return sorted
}

function dataHoje() {
  const d = new Date()
  const ano = d.getFullYear()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
}

const FORM_VAZIO = {
  produto_id: '',
  tipo: '',
  quantidade: '',
  data_movimentacao: dataHoje(),
  observacao: ''
}

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [historico, setHistorico] = useState([])
  const [form, setForm] = useState(FORM_VAZIO)
  const [alerta, setAlerta] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')
  const { setUsuario } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    carregarProdutos()
    carregarHistorico()
  }, [])

  function campoForm(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }))
  }

  async function carregarProdutos() {
    const res = await fetch('/api/estoque/produtos')
    if (res.status === 401) { setUsuario(null); navigate('/login'); return }
    if (!res.ok) return
    const data = await res.json()
    setProdutos(bubbleSort(data))
  }

  async function carregarHistorico() {
    const res = await fetch('/api/estoque/historico')
    if (!res.ok) return
    setHistorico(await res.json())
  }

  async function registrar(e) {
    e.preventDefault()
    setErro('')
    setSucesso('')
    setAlerta('')

    const { produto_id, tipo, quantidade, data_movimentacao, observacao } = form

    if (!produto_id) { setErro('Selecione um medicamento.'); return }
    if (!tipo) { setErro('Selecione o tipo de movimentação.'); return }
    if (
      !quantidade ||
      isNaN(Number(quantidade)) ||
      !Number.isInteger(Number(quantidade)) ||
      Number(quantidade) <= 0
    ) {
      setErro('Quantidade deve ser um número inteiro positivo.')
      return
    }
    if (!data_movimentacao) { setErro('Informe a data da movimentação.'); return }

    const res = await fetch('/api/estoque/movimentacao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        produto_id,
        tipo,
        quantidade: Number(quantidade),
        data_movimentacao,
        observacao: observacao || undefined
      })
    })
    const data = await res.json()

    if (res.ok) {
      setSucesso(`${data.message} Estoque atual: ${data.estoque_atual} unidade(s).`)

      if (data.alerta_estoque_minimo) {
        setAlerta(
          `⚠ ALERTA DE ESTOQUE BAIXO: O medicamento "${data.produto_nome}" está abaixo do nível mínimo! ` +
          `Estoque atual: ${data.estoque_atual} unidade(s) | Mínimo: ${data.estoque_minimo} unidade(s). ` +
          `Realize a reposição o quanto antes.`
        )
      }

      setForm({ ...FORM_VAZIO, data_movimentacao: dataHoje() })
      carregarProdutos()
      carregarHistorico()

      setTimeout(() => setSucesso(''), 6000)
    } else {
      setErro(data.error || 'Erro ao registrar movimentação.')
    }
  }

  return (
    <div>
      <h1>FarmaGestão</h1>
      <h2>Movimentação de Estoque</h2>
      <Link to="/">← Voltar ao Menu Principal</Link>
      <hr />

      <h3>Medicamentos Disponíveis (ordem alfabética)</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Fabricante</th>
            <th>Estoque Atual</th>
            <th>Estoque Mínimo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {produtos.length === 0 ? (
            <tr>
              <td colSpan="6">Nenhum medicamento cadastrado.</td>
            </tr>
          ) : (
            produtos.map(p => {
              const baixo = Number(p.estoque_atual) < Number(p.estoque_minimo)
              return (
                <tr key={p.id} style={baixo ? { backgroundColor: '#ffe0e0' } : {}}>
                  <td>{p.nome}</td>
                  <td>{p.categoria}</td>
                  <td>{p.fabricante}</td>
                  <td>{p.estoque_atual}</td>
                  <td>{p.estoque_minimo}</td>
                  <td>{baixo ? 'ESTOQUE BAIXO!' : 'Normal'}</td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      <hr />

      <h3>Registrar Movimentação</h3>

      {alerta && (
        <p style={{ color: 'red', fontWeight: 'bold', border: '2px solid red', padding: '10px' }}>
          {alerta}
        </p>
      )}
      {sucesso && <p style={{ color: 'green', fontWeight: 'bold' }}>{sucesso}</p>}
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <form onSubmit={registrar}>
        <div>
          <label>
            Medicamento: *
            <br />
            <select value={form.produto_id} onChange={campoForm('produto_id')} required>
              <option value="">-- Selecione um medicamento --</option>
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <br />
        <div>
          <label>
            Tipo de Movimentação: *
            <br />
            <select value={form.tipo} onChange={campoForm('tipo')} required>
              <option value="">-- Selecione --</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
          </label>
        </div>
        <br />
        <div>
          <label>
            Quantidade: *
            <br />
            <input
              type="number"
              min="1"
              step="1"
              value={form.quantidade}
              onChange={campoForm('quantidade')}
              required
            />
          </label>
        </div>
        <br />
        <div>
          <label>
            Data da Movimentação: *
            <br />
            <input
              type="date"
              value={form.data_movimentacao}
              onChange={campoForm('data_movimentacao')}
              required
            />
          </label>
        </div>
        <br />
        <div>
          <label>
            Observação:
            <br />
            <input
              type="text"
              value={form.observacao}
              onChange={campoForm('observacao')}
              placeholder="Opcional"
            />
          </label>
        </div>
        <br />
        <button type="submit">Registrar Movimentação</button>{' '}
        <button
          type="button"
          onClick={() => setForm({ ...FORM_VAZIO, data_movimentacao: dataHoje() })}
        >
          Limpar
        </button>
      </form>

      <hr />

      <h3>Histórico de Movimentações</h3>
      <table border="1" cellPadding="5">
        <thead>
          <tr>
            <th>Data</th>
            <th>Medicamento</th>
            <th>Tipo</th>
            <th>Quantidade</th>
            <th>Responsável</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          {historico.length === 0 ? (
            <tr>
              <td colSpan="6">Nenhuma movimentação registrada.</td>
            </tr>
          ) : (
            historico.map(h => (
              <tr key={h.id}>
                <td>{h.data_movimentacao}</td>
                <td>{h.produto_nome}</td>
                <td>{h.tipo === 'entrada' ? 'Entrada' : 'Saída'}</td>
                <td>{h.quantidade}</td>
                <td>{h.usuario_nome}</td>
                <td>{h.observacao || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
