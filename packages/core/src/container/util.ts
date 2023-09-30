import {Container} from './Container'
import {TClassConstructor} from '../types'
import {isClassInstance} from '../util'
import {TContainerKey} from './types'
import {ContainerImportError, makeNoOwnBindingError} from './exceptions'

export function bindingToString(key: TContainerKey): string {

  // string
  if (typeof key === 'string') {
    return key
  }

  // symbol
  if (typeof key === 'symbol') {
    return key.toString()
  }

  if (typeof key === 'function') {
    if ('constructor' in key) {

      // class
      const name: string = (<any>key).name
      return `Class(${name})`

    } else {

      // function
      const name: string = (<Function>key).name
      return `Function(${name})`

    }
  }

  return `Unknown(${(<any>key).toString()})`
}

export function getContainerName(container: Container | TClassConstructor<Container>): string {

  if (isClassInstance(container)) {
    return container.constructor.name
  }

  return container.name
}

export function assertOwnBinding(c: Container, key: TContainerKey) {
  if (!c.hasOwnBind(key)) {
    throw makeNoOwnBindingError(c, key)
  }
}

export function assertOwnBindingOrAlias(c: Container, key: TContainerKey) {
  if (!c.hasOwnBindOrAlias(key)) {
    throw makeNoOwnBindingError(c, key)
  }
}

export function assertContainerImporterNoLoop(container: Container, parentContainer: Container) {

  if (parentContainer === container) {
    throw new ContainerImportError(
      parentContainer,
      container,
      `Cannot import ${getContainerName(container)} to itself`,
    )
  }

  let current: Container | null = parentContainer
  let deep = 0

  while (true) {
    if (current === container || deep > 100) {
      throw new ContainerImportError(
        container,
        parentContainer,
        `Cannot import ${getContainerName(parentContainer)} to ${getContainerName(container)} because it leads to endless loop`,
      )
    }

    if (!current || current.isRootContainer()) {
      return
    }

    current = current.getImporterContainer()
    deep++
  }
}
