var L = require('../dist/cjs')

describe('reactive', () => {
  it('watchEffect', () => {
    var S = L.useState({
        foo: 'bar',
      }),
      temp = 1

    L.watchEffect(() => S.foo && temp++)

    expect(temp).toBe(2)
    S.foo = false
    expect(temp).toBe(2)
    S.foo = '234'
    expect(temp).toBe(3)
  })
})
