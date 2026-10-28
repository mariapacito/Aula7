export const BASE_URL = 'https://jsonplaceholder.typicode.com'

export class ApiError extends Error {
  constructor(status, statusText) {
    super(statusText)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function requisicao(caminho, opcoes = {}) {
  const {
    signal,
    body,
    headers: headersDaChamada = {},
    ...resto
  } = opcoes

  const configuracoes = {
    ...resto,
    headers: {
      'Content-Type': 'application/json',
      ...headersDaChamada
    },
    ...(signal ? { signal } : {})
  }

  if (body !== undefined) {
    configuracoes.body = JSON.stringify(body)
  }

  const resp = await fetch(`${BASE_URL}${caminho}`, configuracoes)

  if (!resp.ok) {
    throw new ApiError(resp.status, resp.statusText)
  }

  if (resp.status === 204) {
    return null
  }

  return await resp.json()
}

export function apiGet(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'GET' })
}

export function apiPost(caminho, body, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'POST', body })
}

export function apiPut(caminho, body, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'PUT', body })
}

export function apiDelete(caminho, opcoes = {}) {
  return requisicao(caminho, { ...opcoes, method: 'DELETE' })
}