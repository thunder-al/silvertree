export function getHttpRootServiceInjectKey(scope?: string): string {
  return `http:service:${scope ?? 'default'}`
}

export function getHttpRootRegistrarInjectKey(scope?: string): string {
  return `http:registrar:${scope ?? 'default'}`
}

export function getFastifyInjectKey(scope?: string): string {
  return `http:fastify:${scope ?? 'default'}`
}
