import {test} from 'vitest'
import {InMemoryStorageDriver} from '../InMemoryStorageDriver'
import {testStorageDriverGeneral} from './StorageDriverGeneralChecks'

test('InMemoryStorageDriver', async () => {
  const driver = new InMemoryStorageDriver(null)
  await testStorageDriverGeneral(driver)
})
