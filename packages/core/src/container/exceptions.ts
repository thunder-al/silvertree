import {Container} from './Container'

export class ContainerError extends Error {
  constructor(
    public readonly container: Container,
    message?: string,
  ) {
    super(message)
  }
}
