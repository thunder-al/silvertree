import {expect, test} from 'vitest'
import {Container} from '../Container'

test('simple import', () => {
  class C1 extends Container {
    setup() {
      this.import(C2)
    }
  }

  class C2 extends Container {
  }


  const c = new C1
  c.init()

  // root container should not have imports
  expect(c.getImporterContainer()).toBeNull()

  // root container should have C2 in imports
  expect(c.getImportedContainer(C2)).toBeInstanceOf(C2)
})

test('destroy cycle with 2 containers', () => {
  const C1 = new Container()
  const C2 = new Container()

  C1.import(C2)

  expect(C2.getImporterContainer()).toBe(C1)

  C2.destroy()

  expect(C1.getImports().size).toBe(0)

  expect(C2.getImporterContainer()).toBeNull()
  expect(C2.getImports().size).toBe(0)
})

test('destroy cycle with 3 containers', () => {
  const C1 = new Container()
  const C2 = new Container()
  const C3 = new Container()

  C1.import(C2)
  C2.import(C3)

  expect(C2.getImporterContainer()).toBe(C1)
  expect(C3.getImporterContainer()).toBe(C2)

  C2.destroy()

  expect(C1.getImports().size).toBe(0)

  expect(C2.getImporterContainer()).toBeNull()
  expect(C2.getImports().size).toBe(0)

  expect(C3.getImporterContainer()).toBeNull()
  expect(C3.getImports().size).toBe(0)
})
