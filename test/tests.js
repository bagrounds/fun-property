;(() => {
  'use strict'

  /* imports */
  const scalar = require('fun-scalar')
  const fn = require('fun-function')
  const predicate = require('fun-predicate')
  const object = require('fun-object')
  const funTest = require('fun-test')
  const arrange = require('fun-arrange')
  const array = require('fun-array')
  const generate = require('fun-generator')
  const type = require('fun-type')

  const arrayMonoid = {
    type: type.arrayOf(type.num),
    op: array.concat,
    unit: array.empty,
    equal: array.equal(scalar.equal)
  }

  const intFunComposition = {
    op: fn.compose,
    unit: fn.k(fn.id),
    equal: (f, g) => {
      const x = generate.integer(-100, 100, Math.random())
      return f(x) === g(x)
    }
  }

  const isInteger = a => type.num(a) && Math.floor(a) === a

  const integerMultiplication = {
    type: isInteger,
    op: scalar.dot,
    equal: scalar.equal,
    unit: fn.k(1)
  }

  const integerAddition = {
    type: isInteger,
    op: scalar.sum,
    inverse: scalar.neg,
    equal: scalar.equal,
    unit: fn.k(0)
  }

  const arrayConcatToIntAddFunctor = {
    omap: array.fold(integerAddition.op, integerAddition.unit()),
    fmap: fn.compose(array.fold(integerAddition.op, integerAddition.unit())),
    fromCat: arrayMonoid,
    toCat: integerAddition
  }

  const integerSubtraction = {
    type: isInteger,
    op: scalar.sub,
    equal: predicate.equal,
    unit: fn.k(0)
  }

  const identityFun = {
    f: fn.id,
    equal: predicate.equal
  }

  const mul1 = {
    f: scalar.dot(1),
    equal: predicate.equal
  }

  const add0 = {
    f: scalar.sum(0),
    equal: predicate.equal
  }

  const addSelf = x => x + x

  const addSelfMul2 = {
    f1: addSelf,
    f2: scalar.dot(2),
    equal: predicate.equal
  }

  const randomIntArrays = (max, n) => generate.arrayOf(
    generate.arrayOf(generate.integer(-100, 100)),
    array.index(n)
      .map(fn.composeAll([
        array.map(Math.random),
        fn.compose(array.index, generate.integer(1, max)),
        Math.random
      ]))
  )

  const randomInts = n => array.map(
    generate.integer(-100, 100),
    array.map(Math.random, array.index(n))
  )

  const randIntFun = () => generate.fn(
    scalar.dot(generate.integer(-200, 200, Math.random())),
    generate.integer(-100, 100),
    fn.composeAll([
      scalar.abs,
      scalar.mod(1),
      scalar.dot(Math.random()),
      scalar.sum
    ]),
    Math.random()
  )

  const equalityTests = [
    [
      [randomIntArrays(10, 3), arrayConcatToIntAddFunctor],
      true,
      'functor'
    ],
    [
      [array.map(randIntFun, array.index(3)), intFunComposition],
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
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }))

  /* exports */
  module.exports = equalityTests.map(funTest.sync)
})()

