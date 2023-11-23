import {Container} from './Container'

export class ContainerProviderError extends Error {
  constructor(
    public readonly container: Container,
    message?: string,
  ) {
    super(message)
  }
}
