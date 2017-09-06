;(function () {
  'use strict'

  /* imports */
  var predicate = require('fun-predicate')
  var object = require('fun-object')
  var funTest = require('fun-test')
  var arrange = require('fun-arrange')
  var array = require('fun-array')
  var generate = require('fun-generator')
  var type = require('fun-type')

  var integerMultiplication = {
    type: function int (a) {
      return type.num(a) &&
        Math.floor(a) === a
    },
    op: function mul (a, b) {
      return a * b
    },
    equal: function equal (a, b) {
      return a === b
    },
    unit: function one () {
      return 1
    }
  }

  var integerAddition = {
    type: function int (a) {
      return type.num(a) &&
        Math.floor(a) === a
    },
    op: function add (a, b) {
      return a + b
    },
    inverse: function equal (a) {
      return -a
    },
    equal: function equal (a, b) {
      return a === b
    },
    unit: function zero () {
      return 0
    }
  }

  var integerSubtraction = {
    type: function int (a) {
      return type.num(a) &&
        Math.floor(a) === a
    },
    op: function sub (a, b) {
      return a - b
    },
    equal: function equal (a, b) {
      return a === b
    },
    unit: function zero () {
      return 0
    }
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

  var equalityTests = [
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

