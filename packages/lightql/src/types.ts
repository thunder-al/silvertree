/**
 * Utility class to separate keys and entities in dto
 */
export type TKeysByTypeExcept<T extends object, E> = { [K in keyof T]: T[K] extends E ? never : K }[keyof T]

/**
 * DataTypeObject represents how data is stored in response
 */
export type DtoEntity<Name extends string> = { $entity?: Name }

/**
 * DtoEntityRef is a thin wrapper around 1x1/Mx1 relation in dto
 */
export type DtoEntityRef<T extends DtoEntity<any>> = T & { $entityRef?: true }

/**
 * DtoEntityArrayRef is a thin wrapper around 1xM/MxM relation in dto
 */
export type DtoEntityArrayRef<T extends DtoEntity<any>> = Array<T> & { $entityRef?: true }

/**
 * List of object's own fields
 */
export type TEntityQuerySelect<DTO extends DtoEntity<string>>
  = Array<Exclude<TKeysByTypeExcept<DTO, { $entityRef?: true }>, '$entity'>>

/**
 * Query of object's own relations
 */
export type TEntityQueryEntities<DTO extends DtoEntity<string>> = {
  [K in keyof DTO]?: DTO[K] extends DtoEntityArrayRef<infer T>
    ? IEntityQuery<T>
    : DTO[K] extends DtoEntityRef<infer T>
      ? IEntityQuery<T>
      : never
}

/**
 * Filter rule
 */
export interface IEntityQueryFilterRule {
  /**
   * Field, relation or virtual field name
   */
  target: string
  /**
   * Operator, e.g. eq, gt, lt, etc.
   */
  operator: string
  /**
   * Value to compare with
   */
  value: any
}

/**
 * Filter rule group
 */
export interface IEntityQueryFilterGroup {
  condition: 'and' | 'or'
  rules: Array<IEntityQueryFilterRule>
}

/**
 * IEntityQuery is a query object that used to fetch data from server with specific structure
 */
export interface IEntityQuery<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  select: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
  filters?: Array<IEntityQueryFilterRule | IEntityQueryFilterGroup>
}

/**
 * Common request structure
 */
export interface IEntityQueryRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: string
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
  filters?: Array<IEntityQueryFilterRule | IEntityQueryFilterGroup>
}

/**
 * Request for list action. Will return an array of entities
 */
export interface IEntityListRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'list'
  limit: number
  offset: number
  select: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
  filters?: Array<IEntityQueryFilterRule | IEntityQueryFilterGroup>
}

/**
 * Request for get action. Will return a single entity
 */
export interface IEntityGetRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'get'
  key: string | number
  select: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
}

/**
 * Request for create action. Will return created entity
 */
export interface IEntityCreateRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'create'
  data: DTO
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
}

/**
 * Request for update action. Will return updated entity
 */
export interface IEntityUpdateRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'update'
  key: string | number
  data: Partial<DTO>
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
}

/**
 * Request for delete action. Will return deleted entity before its deletion
 */
export interface IEntityDeleteRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'delete'
  key: string | number
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
}

/**
 * Request for deleting multiple entities by given filter. Will return an array of deleted entities before their deletion
 */
export interface IEntityDeleteManyRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'deleteMany'
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
  filters: Array<IEntityQueryFilterRule | IEntityQueryFilterGroup>
}

/**
 * Request for restore action. Will return restored entity. Works only with soft-deleted entities
 */
export interface IEntityRestoreRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'restore'
  key: string | number
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
}

/**
 * Request for restoring multiple entities by given filter. Will return an array of restored entities. Works only with soft-deleted entities
 */
export interface IEntityRestoreManyRequest<DTO extends DtoEntity<string>> {
  name: DTO['$entity']
  action: 'restoreMany'
  key: string | number
  select?: TEntityQuerySelect<DTO>
  entities?: TEntityQueryEntities<DTO>
  filters: Array<IEntityQueryFilterRule | IEntityQueryFilterGroup>
}
