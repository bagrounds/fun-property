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

  var integerFunctionComposition = {
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

  function randomIntArrays (n, m) {
    return generate.arrayOf(
      generate.arrayOf(generate.integer(-100, 100)),
      array.index(3)
        .map(fn.k(array.index(generate.integer(1, 5, Math.random()))))
        .map(array.map(Math.random))
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

  function randomIntegerFunction () {
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
      [
        [
          randomInts(3),
          randomInts(5),
          randomInts(7)
        ],
        arrayConcatToIntAddFunctor
      ],
      true,
      'functor'
    ],
    [
      [
        array.map(randomIntegerFunction, array.index(3)),
        integerFunctionComposition
      ],
      true,
      'category'
    ],
    [
      [
        [3, 4],
        integerSubtraction
      ],
      false,
      'commutative'
    ],
    [
      [
        randomInts(2),
        integerMultiplication
      ],
      true,
      'commutative'
    ],
    [
      [
        randomIntArrays(),
        arrayMonoid
      ],
      true,
      'monoid'
    ],
    [
      [
        randomInts(3),
        integerMultiplication
      ],
      true,
      'monoid'
    ],
    [
      [
        randomInts(3),
        integerAddition
      ],
      true,
      'abelianGroup'
    ]
  ].map(arrange({ inputs: 0, predicate: 1, contra: 2 }))
    .map(object.ap({
      predicate: predicate.equalDeep,
      contra: object.get
    }))

  /* exports */
  module.exports = equalityTests.map(funTest.sync)
})()

