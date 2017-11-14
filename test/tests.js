;(function () {
  'use strict'

  /* imports */
  var scalar = require('fun-scalar')
  var fn = require('fun-function')
  var predicate = require('fun-predicate')
  var object = require('fun-object')
  var funTest = require('fun-test')
  var arrange = require('fun-arrange')
  var array = require('fun-array')
  var generate = require('fun-generator')
  var type = require('fun-type')

  var arrayMonoid = {
    type: type.arrayOf(type.num),
    op: array.concat,
    unit: array.empty,
    equal: array.equal(scalar.equal)
  }

  var intFunComposition = {
    op: fn.compose,
    unit: fn.k(fn.id),
    equal: function equal (f, g) {
      var x = generate.integer(-100, 100, Math.random())
      return f(x) === g(x)
    }
  }

  function isInteger (a) {
    return type.num(a) &&
      Math.floor(a) === a
  }

  var integerMultiplication = {
    type: isInteger,
    op: scalar.dot,
    equal: scalar.equal,
    unit: fn.k(1)
  }

  var integerAddition = {
    type: isInteger,
    op: scalar.sum,
    inverse: scalar.neg,
    equal: scalar.equal,
    unit: fn.k(0)
  }

  var arrayConcatToIntAddFunctor = {
    omap: array.fold(integerAddition.op, integerAddition.unit()),
    fmap: fn.curry(function (f, i) {
      return array.fold(integerAddition.op, integerAddition.unit(), f(i))
    }),
    fromCat: arrayMonoid,
    toCat: integerAddition
  }

  var integerSubtraction = {
    type: isInteger,
    op: scalar.sub,
    equal: predicate.equal,
    unit: fn.k(0)
  }

  var identityFun = {
    f: fn.id,
    equal: predicate.equal
  }

  var mul1 = {
    f: scalar.dot(1),
    equal: predicate.equal
  }

  var add0 = {
    f: scalar.sum(0),
    equal: predicate.equal
  }

  function randomIntArrays (max, n) {
    return generate.arrayOf(
      generate.arrayOf(generate.integer(-100, 100)),
      array.index(n)
        .map(fn.composeAll([
          array.map(Math.random),
          fn.compose(array.index, generate.integer(1, max)),
          Math.random
        ]))
    )
  }

  function randomInts (n) {
    return array.map(
      generate.integer(-100, 100),
      array.map(
        Math.random,
        array.index(n)
      )
    )
  }

  function randIntFun () {
    return generate.fn(
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
  }

  var equalityTests = [
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
    [[randomIntArrays(10, 3), arrayMonoid], true, 'monoid'],
    [[randomInts(3), integerMultiplication], true, 'monoid'],
    [[randomInts(3), integerAddition], true, 'abelianGroup'],
    [[randomInts(1), identityFun], true, 'idempotent'],
    [[randomInts(1)[0], mul1], true, 'idempotent'],
    [[randomInts(1)[0], add0], true, 'idempotent']
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }))

  /* exports */
  module.exports = equalityTests.map(funTest.sync)
})()

