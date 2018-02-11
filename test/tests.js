;(() => {
  'use strict'

  /* imports */
  const { add, sub, mul, neg, abs, mod } = require('fun-scalar')
  const { k, id, compose, composeAll } = require('fun-function')
  const { equalDeep: equal } = require('fun-predicate')
  const { ap, get } = require('fun-object')
  const { sync } = require('fun-test')
  const arrange = require('fun-arrange')
  const { map, concat, empty, of, index, flatMap, iterateN, repeat } =
    require('fun-array')
  const generate = require('fun-generator')
  const { arrayOf, num } = require('fun-type')

  const arrayMonoid = { type: arrayOf(num), op: concat, unit: empty, equal }

  const intFunComposition = {
    op: compose,
    unit: k(id),
    equal: (f, g) => {
      const x = generate.integer(-100, 100, Math.random())
      return f(x) === g(x)
    }
  }

  const isInteger = a => num(a) && Math.floor(a) === a

  const integerMultiplication = { type: isInteger, op: mul, unit: k(1), equal }

  const integerAddition = {
    type: isInteger,
    op: add,
    inverse: neg,
    equal: equal,
    unit: k(0)
  }

  const maybeFunctor = {
    omap: x => x == null ? { none: true } : { some: x },
    fmap: (f, m) => m.none === true ? m : ap({ some: f }, m),
    idS: id,
    equalT: equal
  }

  const arrayFunctor = { omap: of, fmap: map, idS: id, equalT: equal }
  const arrayMonad = { chain: flatMap, of, idS: id, equalT: equal }

  const integerSubtraction = { type: isInteger, op: sub, unit: k(0), equal }

  const identityFun = { f: id, equal }

  const mul1 = { f: mul(1), equal }
  const add0 = { f: add(0), equal }
  const addSelf = x => x + x
  const addSelfMul2 = { f1: addSelf, f2: mul(2), equal }

  const randomIntArrays = (max, n) => generate.arrayOf(
    generate.arrayOf(generate.integer(-100, 100)),
    map(composeAll([
      map(Math.random),
      compose(index, generate.integer(1, max)),
      Math.random
    ]), index(n))
  )

  const randomInts = n => map(
    generate.integer(-100, 100),
    map(Math.random, index(n))
  )

  const randomSmallNat = () => generate.integer(1, 10, Math.random())

  const randIntFun = () => generate.fn(
    mul(generate.integer(-200, 200, Math.random())),
    generate.integer(-100, 100),
    composeAll([abs, mod(1), mul(Math.random()), add]),
    Math.random()
  )

  const equalityTests = map(compose(
    ap({ predicate: equal, contra: get }),
    arrange({ inputs: 0, predicate: 1, contra: 2 })
  ), [
    [
      [[randomSmallNat(), index, iterateN(mul(2), 3), repeat(2)], arrayMonad],
      true,
      'monad'
    ],
    [
      [
        [
          generate.member([undefined, null, Math.random()], Math.random()),
          randIntFun(),
          randIntFun()
        ],
        maybeFunctor
      ],
      true,
      'functor'
    ],
    [
      [[...randomInts(1), randIntFun(), randIntFun()], arrayFunctor],
      true,
      'functor'
    ],
    [
      [map(randIntFun, index(3)), intFunComposition],
      true,
      'category'
    ],
    [[[3, 4], integerSubtraction], false, 'commutative'],
    [[randomInts(2), integerMultiplication], true, 'commutative'],
    [[randomIntArrays(10, 3), arrayMonoid], true, 'semigroup'],
    [[randomIntArrays(10, 3), arrayMonoid], true, 'monoid'],
    [[randomInts(3), integerMultiplication], true, 'monoid'],
    [[randomInts(3), integerMultiplication], true, 'associative'],
    [[randomInts(2), integerAddition], true, 'closed'],
    [[randomInts(3), integerAddition], true, 'abelianGroup'],
    [[randomInts(3), integerAddition], true, 'group'],
    [[randomInts(1), integerAddition], true, 'identity'],
    [[randomInts(1), integerAddition], true, 'leftIdentity'],
    [[randomInts(1), integerAddition], true, 'rightIdentity'],
    [[randomInts(1), integerAddition], true, 'inverse'],
    [[randomInts(1), integerAddition], true, 'leftInverse'],
    [[randomInts(1), integerAddition], true, 'rightInverse'],
    [[randomInts(1), identityFun], true, 'idempotent'],
    [[randomInts(1), mul1], true, 'idempotent'],
    [[randomInts(1), add0], true, 'idempotent'],
    [[randomInts(1), addSelfMul2], true, 'equalFor']
  ])

  /* exports */
  module.exports = map(sync, equalityTests)
})()

