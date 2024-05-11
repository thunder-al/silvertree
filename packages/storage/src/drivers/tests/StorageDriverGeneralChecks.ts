import {StorageDriver} from '../../StorageDriver'
import {expect} from 'vitest'

export async function testStorageDriverGeneral(driver: StorageDriver) {

  await driver.put('file.txt', 'Hello World')
  expect(await driver.get('file.txt')).toBe('Hello World')

  await driver.put('file.txt', Buffer.from('Hello World'))
  expect(await driver.get('file.txt')).toBe('Hello World')

  // not created -- should not return true
  expect(await driver.exists('file2.txt')).toBe(false)

  await driver.delete('file.txt')
  expect(await driver.exists('file.txt')).toBe(false)

  await driver.append('file.txt', 'World')
  await driver.prepend('file.txt', 'Hello ')

  expect(await driver.exists('file.txt')).toBe(true)
  expect(await driver.get('file.txt')).toBe('Hello World')
  expect(await driver.getBuffer('file.txt')).toStrictEqual(Buffer.from('Hello World'))
  expect(await driver.getStat('file.txt')).toStrictEqual(expect.objectContaining({size: 11}))

  {
    // stream
    const stream = await driver.getStream('file.txt')
    const chunks: Array<Buffer> = []
    for await (const chunk of stream) {
      // noinspection SuspiciousTypeOfGuard
      chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
    }
    expect(Buffer.concat(chunks).toString()).toBe('Hello World')
  }

  {
    // list
    const iter = driver.listFilesRecursive('')
    const files = []
    for await (const file of iter) {
      files.push(file)
    }

    expect(files).toStrictEqual(['file.txt'])
  }

  await driver.delete('file.txt')
  expect(await driver.exists('file.txt')).toBe(false)

  await driver.put('file.txt', 'Hello World2')
  expect(await driver.get('file.txt')).toBe('Hello World2')

  await driver.put('file.txt', Buffer.from('Hello World3'))
  expect(await driver.get('file.txt')).toBe('Hello World3')

  await driver.copy('file.txt', 'file2.txt')
  expect(await driver.get('file2.txt')).toBe('Hello World3')

  await driver.move('file2.txt', 'dir/file.txt')
  expect(await driver.get('dir/file.txt')).toBe('Hello World3')
  expect(await driver.exists('file2.txt')).toBe(false)

  await driver.deleteRecursive('')
  expect(await driver.exists('file.txt')).toBe(false)
  expect(await driver.exists('file2.txt')).toBe(false)
  expect(await driver.exists('dir/file3.txt')).toBe(false)

  // multiple files and paths
  await driver.put('file1.txt', 'Hello World1')
  await driver.put('file2.txt', 'Hello World2')
  await driver.put('dir/file3.txt', 'Hello World3')
  await driver.put('dir/file4.txt', 'Hello World4')
  await driver.put('dir/subdir/file5.txt', 'Hello World5')
  await driver.put('dir/subdir/file6.txt', 'Hello World6')

  {
    // list
    const files = []
    for await (const file of driver.listFilesRecursive('')) {
      files.push(file)
    }

    expect(files.sort()).toStrictEqual([
      'file1.txt', 'file2.txt',
      'dir/file3.txt', 'dir/file4.txt',
      'dir/subdir/file5.txt', 'dir/subdir/file6.txt',
    ].sort())
  }

  expect(await driver.exists('file1.txt')).toBe(true)
  expect(await driver.exists('file2.txt')).toBe(true)
  expect(await driver.exists('dir/file3.txt')).toBe(true)
  expect(await driver.exists('dir/file4.txt')).toBe(true)
  expect(await driver.exists('dir/subdir/file5.txt')).toBe(true)
  expect(await driver.exists('dir/subdir/file6.txt')).toBe(true)

  await driver.deleteRecursive('dir/subdir')
  expect(await driver.exists('file1.txt')).toBe(true)
  expect(await driver.exists('file2.txt')).toBe(true)
  expect(await driver.exists('dir/file3.txt')).toBe(true)
  expect(await driver.exists('dir/file4.txt')).toBe(true)
  expect(await driver.exists('dir/subdir/file5.txt')).toBe(false)
  expect(await driver.exists('dir/subdir/file6.txt')).toBe(false)


  await driver.deleteRecursive('dir')
  expect(await driver.exists('file1.txt')).toBe(true)
  expect(await driver.exists('file2.txt')).toBe(true)
  expect(await driver.exists('dir/file3.txt')).toBe(false)
  expect(await driver.exists('dir/file4.txt')).toBe(false)
  expect(await driver.exists('dir/subdir/file5.txt')).toBe(false)
  expect(await driver.exists('dir/subdir/file6.txt')).toBe(false)

  await driver.deleteRecursive('')
  expect(await driver.exists('file1.txt')).toBe(false)
  expect(await driver.exists('file2.txt')).toBe(false)
  expect(await driver.exists('dir/file3.txt')).toBe(false)
  expect(await driver.exists('dir/file4.txt')).toBe(false)
  expect(await driver.exists('dir/subdir/file5.txt')).toBe(false)
  expect(await driver.exists('dir/subdir/file6.txt')).toBe(false)

  // root always should exist
  expect(await driver.exists('')).toBe(true)
}
