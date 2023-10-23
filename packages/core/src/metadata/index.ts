export * from './reader'
export * from './writer'

export type TTapMetaFunc<I = any, O = any> = (currentMeta: I) => O

export const METADATA_PREFIX = 'svt:'
