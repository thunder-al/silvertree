export type TClassConstructor<T = any, C extends Array<any> = Array<any>>
  = { new(...args: C): T }

