import {test} from 'vitest'
import {FilesystemStorageDriver} from '../FilesystemStorageDriver'
import {testStorageDriverGeneral} from './StorageDriverGeneralChecks'
import * as fs from 'node:fs/promises'
import * as path from 'node:path'
import * as os from 'node:os'

test('FilesystemStorageDriver', async () => {
  const rootPath = await fs.mkdtemp(path.join(os.tmpdir(), 'vitest-svt-'))
  const driver = new FilesystemStorageDriver({rootPath})
  await testStorageDriverGeneral(driver)
  await fs.rm(rootPath, {recursive: true})
})
