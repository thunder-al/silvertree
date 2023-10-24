import 'reflect-metadata'

/**
 * Helper type for a class constructor.
 */
export type TClassConstructor<T = any, C extends Array<any> = Array<any>>
  = { new(...args: C): T }

/**
 * A binding key for providing or injecting a resource.
 */
export type TBindKey = string | TClassConstructor | symbol

/**
 * A binding key reference.
 */
export type TBindKeyRef = { (): TBindKey, __isBindRef: true }

/**
 * Additional context parameters for injection
 */
export interface IInjectOptions {

}

export interface TClassInjectPropertyMetadataItem {
  /**
   * The binding key or alias.
   */
  k: TBindKey | TBindKeyRef

  /**
   * The property name.
   */
  p: string | symbol

  /**
   * Inject options.
   */
  o?: Partial<IInjectOptions>
}

export interface TClassInjectArgumentMetadataItem {
  /**
   * The binding key or alias.
   */
  k: TBindKey | TBindKeyRef

  /**
   * The property (method) name.
   * If null, then it is a constructor parameter.
   */
  p: string | symbol | null

  /**
   * The argument index.
   */
  i: number

  /**
   * Inject options.
   */
  o?: Partial<IInjectOptions>
}
