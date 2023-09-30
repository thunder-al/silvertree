import {expect, test} from 'vitest'
import {Container} from '../Container'
import {ContainerImportError} from '../exceptions'

test('import itself', () => {
  class C1 extends Container {
    setup() {
      this.import(C1)
    }
  }

  expect(() => (new C1).init()).toThrowError(ContainerImportError)
})

test('simple cycle import', () => {
  class C1 extends Container {
    setup() {
      this.import(C2)
    }
  }

  class C2 extends Container {
    setup() {
      this.import(C1)
    }
  }

  expect(() => (new C1).init()).toThrowError(ContainerImportError)
})

test('cycle import', () => {
  class C1 extends Container {
    setup() {
      this.import(C2)
    }
  }

  class C2 extends Container {
    setup() {
      this.import(C3)
    }
  }

  class C3 extends Container {
    setup() {
      this.import(C1)
    }
  }

  expect(() => (new C1).init()).toThrowError(ContainerImportError)
})

test('P shape cycle import', () => {
  class C1 extends Container {
    setup() {
      this.import(C2)
    }
  }

  class C2 extends Container {
    setup() {
      this.import(C3)
    }
  }

  class C3 extends Container {
    setup() {
      this.import(C2)
    }
  }

  expect(() => (new C1).init()).toThrowError(ContainerImportError)
})
test('cycle import with inline containers', () => {

  expect(() => {

    const C1 = new Container()
    C1.import(C1)

  }, 'should fail on self import').toThrowError(ContainerImportError)

  expect(() => {

    const C1 = Object.assign(new Container(), {dbg_tag: 1})
    const C2 = Object.assign(new Container(), {dbg_tag: 2})
    const C3 = Object.assign(new Container(), {dbg_tag: 3})

    C1.import(C2)
    C2.import(C3)
    C3.import(C1)

  }, 'should fail on cycle import').toThrowError(ContainerImportError)
})
