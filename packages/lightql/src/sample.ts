import {DtoEntity, DtoEntityArrayRef, DtoEntityRef, IEntityListRequest} from './types'

interface User extends DtoEntity<'user'> {
  readonly id: string
  name: string
  post: DtoEntityRef<Post>
  posts: DtoEntityArrayRef<Post>
}

interface Post extends DtoEntity<'post'> {
  readonly id: string
  title: string
  content: string
}


// sample request
const request: IEntityListRequest<User> = {
  name: 'user',
  action: 'list',
  limit: 10,
  offset: 0,
  select: [
    'id',
    'name',
  ],
  entities: {
    post: {
      name: 'post',
      select: [
        'title',
      ],
    },
    posts: {
      name: 'post',
      select: [
        'title',
        'content',
      ],
    },
  },
  filters: [
    {
      condition: 'or',
      rules: [
        {target: 'name', operator: 'eq', value: 'John'},
        {target: 'name', operator: 'eq', value: 'Jane'},
      ],
    },
    {target: 'post.title', operator: 'icontains', value: 'Hello world'},
  ],
}


