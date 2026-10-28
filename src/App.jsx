import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from './api'

function mensagemDeErro(e, mensagem404, mensagemGeral) {
  if (e.name === 'ApiError' && e.status === 404) {
    return mensagem404
  } else if (e.name === 'ApiError' && e.status >= 500) {
    return 'Erro no servidor. Tente de novo em instantes.'
  } else if (e.name === 'ApiError') {
    return mensagemGeral
  } else {
    return 'Falha de rede: não foi possível se comunicar com a API.'
  }
}

function App() {
  const [usuarios, setUsuarios] = useState([])
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [editandoId, setEditandoId] = useState(null)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const controle = new AbortController()

    async function buscar() {
      try {
        const data = await apiGet('/users', { signal: controle.signal })
        setUsuarios(data)
        setCarregando(false)
      } catch (e) {
        if (e.name === 'AbortError') return
        setErro(mensagemDeErro(e, 'Recurso não encontrado.', 'Não foi possível carregar os usuários.'))
        setCarregando(false)
      }
    }

    buscar()

    return () => controle.abort()
  }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')

    try {
      if (editandoId) {
        const atualizado = await apiPut(`/users/${editandoId}`, { name: nome, email })
        setUsuarios(usuarios.map(u => (u.id === editandoId ? { ...u, ...atualizado } : u)))
      } else {
   
        const criado = await apiPost(
          '/users',
          { name: nome, email },
          { headers: { 'X-Custom': 'aula07' } }
        )
        setUsuarios([...usuarios, criado])
      }
      cancelarEdicao()
    } catch (e) {
      setErro(mensagemDeErro(e, 'Usuário não encontrado.', 'Não foi possível salvar o usuário.'))
    }
  }

  async function excluir(id) {
    setErro('')

    try {
      await apiDelete(`/users/${id}`)
      setUsuarios(usuarios.filter(u => u.id !== id))
    } catch (e) {
      setErro(mensagemDeErro(e, 'Usuário não encontrado.', 'Não foi possível excluir o usuário.'))
    }
  }

  function editar(usuario) {
    setEditandoId(usuario.id)
    setNome(usuario.name)
    setEmail(usuario.email)
  }

  function cancelarEdicao() {
    setEditandoId(null)
    setNome('')
    setEmail('')
  }

  async function testar404() {
    setErro('')
    try {
      await apiGet('/users/999')
    } catch (e) {
      setErro(mensagemDeErro(e, 'Recurso não encontrado.', 'Não foi possível consultar o usuário.'))
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1>Usuários</h1>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <form onSubmit={salvar}>
        <input
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <input
          placeholder="E-mail"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit">{editandoId ? 'Atualizar' : 'Cadastrar'}</button>
        {editandoId && (
          <button type="button" onClick={cancelarEdicao}>Cancelar</button>
        )}
      </form>

      <button onClick={testar404}>Testar 404</button>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <ul>
          {usuarios.map(u => (
            <li key={u.id}>
              {u.name} ({u.email}){' '}
              <button onClick={() => editar(u)}>Editar</button>{' '}
              <button onClick={() => excluir(u.id)}>Excluir</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App