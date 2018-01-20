/**
 *
 * @module fun-property
 */
;(() => {
  'use strict'

  /* imports */
  const { apply, lift, curry, compose, composeAll } = require('fun-function')
  const { arrayOf, hasFields, vector, fun, bool, tuple } = require('fun-type')
  const { map, ap } = require('fun-object')
  const { inputs, output } = require('guarded')
  const { all, and, t } = require('fun-predicate')

  const idOf = ({op, unit}) => curry(op)(unit())

  /**
   *
   * @function module:fun-property.equalFor
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.equal - (a, b) -> bool
   * @param {Function} instance.f1 - (...xs) -> y
   * @param {Function} instance.f2 - (...xs) -> z
   *
   * @return {Boolean} if f1(x) = f2(x)
   */
  const equalFor = (xs, {equal, f1, f2}) => apply(xs, lift(equal)(f1)(f2))

  /**
   *
   * @function module:fun-property.idempotent
   *
   * @param {Array} xs - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if f(x) = f(f(x))
   */
  const idempotent = (xs, {f, equal}) =>
    equalFor(xs, { equal, f1: f, f2: compose(f, f) })

  /**
   *
   * @function module:fun-property.closed
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.type - x -> bool
   * @param {Function} instance.op - (x, x) -> x
   *
   * @return {Boolean} if (x, x) -> x
   */
  const closed = ([x0, x1], {type, op}) => arrayOf(type, [x0, x1, op(x0, x1)])

  /**
   *
   * @function module:fun-property.associative
   *
   * @param {Array} xs - 3 inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if ((x1 <> x2) <> x3) = (x1 <> (x2 <> x3))
   */
  const associative = ([x0, x1, x2], {op, equal}) =>
    equal(op(op(x0, x1), x2), op(x0, op(x1, x2)))

  /**
   *
   * @function module:fun-property.commutative
   *
   * @param {Array} xs - 2 inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x1 <> x2) = (x2 <> x1)
   */
  const commutative = ([x0, x1], {equal, op}) => equal(op(x0, x1), op(x1, x0))

  /**
   *
   * @function module:fun-property.leftIdentity
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (() <> x) = x
   */
  const leftIdentity = ([x], {op, unit, equal}) => equal(op(unit(), x), x)

  /**
   *
   * @function module:fun-property.rightIdentity
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> ()) = x
   */
  const rightIdentity = ([x], {op, unit, equal}) => equal(op(x, unit()), x)

  /**
   *
   * @function module:fun-property.identity
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (() <> x) = (x <> ()) = x
   */
  const identity = and(leftIdentity, rightIdentity)

  /**
   *
   * @function module:fun-property.leftInverse
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (-x <> x) = ()
   */
  const leftInverse = ([x], {op, unit, inverse, equal}) =>
    equal(op(inverse(x), x), unit())

  /**
   *
   * @function module:fun-property.rightInverse
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> -x) = ()
   */
  const rightInverse = ([x], {op, unit, inverse, equal}) =>
    equal(op(x, inverse(x)), unit())

  /**
   *
   * @function module:fun-property.inverse
   *
   * @param {Array} xs - 1 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> -x) = (-x <> x) = x
   */
  const inverse = and(leftInverse, rightInverse)

  /**
   *
   * @function module:fun-property.category
   *
   * @param {Array} xs - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if instance is associative with an identity
   */
  const category = and(associative, identity)

  /**
   *
   * @function module:fun-property.semigroup
   *
   * @param {Array} xs - 3 inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.type - x -> bool
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if instance is associative and closed
   */
  const semigroup = and(closed, associative)

  /**
   *
   * @function module:fun-property.monoid
   *
   * @param {Array} xs - 3 input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.type - x -> bool
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if instance is a semigroup with an identity
   */
  const monoid = and(semigroup, identity)

  /**
   *
   * @function module:fun-property.group
   *
   * @param {Array} xs - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.type - x -> bool
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if instance is a monoid with an inverse
   */
  const group = and(monoid, inverse)

  /**
   *
   * @function module:fun-property.abelianGroup
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.type - x -> bool
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if instance is a commutative group
   */
  const abelianGroup = and(group, commutative)

  /**
   *
   * @function module:fun-property.functor
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.omap - maps objects
   * @param {Function} instance.fmap - maps functions
   * @param {Object} instance.fromCat - source category
   * @param {Object} instance.toCat - destination category
   *
   * @return {Boolean} if i is a functor mapping fromCat -> toCat
   */
  const functor = ([x0, x1, x2], {omap, fmap, fromCat, toCat}) => ((id, f, g) =>
    equalFor([x0], {equal: toCat.equal,
      f1: compose(fmap(id), omap),
      f2: compose(omap, id)
    }) &&
    equalFor([x0], {
      equal: toCat.equal,
      f1: composeAll([fmap(f), fmap(g), omap]),
      f2: composeAll([omap, f, g])
    })
  )(idOf(fromCat), curry(fromCat.op)(x1), curry(fromCat.op(x2)))

  /* exports */
  const api = { functor, category, abelianGroup, group, inverse, leftInverse,
    rightInverse, commutative, monoid, semigroup, identity, leftIdentity,
    rightIdentity, closed, associative, idempotent, equalFor }

  const has = (() => { // eslint-disable-line max-statements
    const op = hasFields({ op: fun })
    const unit = hasFields({ unit: fun })
    const equal = hasFields({ equal: fun })
    const inverse = hasFields({ equal: fun })
    const omap = hasFields({ omap: fun })
    const fmap = hasFields({ fmap: fun })
    const type = hasFields({ type: fun })
    const f = hasFields({ f: fun })
    const f1 = hasFields({ f1: fun })
    const f2 = hasFields({ f2: fun })
    const fromCat = hasFields({ fromCat: all([op, unit, equal]) })
    const toCat = hasFields({ toCat: all([op, unit, equal]) })

    return { op, unit, equal, inverse, omap, fmap, type, f, f1, f2, fromCat,
      toCat }
  })()

  const toBool = input => compose(inputs(input), output(bool))
  const boolFromPair = (a, b) => toBool(tuple([a, b]))

  const guards = {
    functor: boolFromPair(
      vector(3),
      all([has.omap, has.fmap, has.fromCat, has.toCat])
    ),
    closed: boolFromPair(
      vector(2),
      all([has.type, has.op])
    ),
    category: boolFromPair(
      vector(3),
      all([has.op, has.unit, has.equal])
    ),
    abelianGroup: boolFromPair(
      vector(3),
      all([has.type, has.op, has.unit, has.inverse, has.equal])
    ),
    group: boolFromPair(
      vector(3),
      all([has.type, has.op, has.unit, has.inverse, has.equal])
    ),
    inverse: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.inverse, has.equal])
    ),
    leftInverse: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.inverse, has.equal])
    ),
    rightInverse: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.inverse, has.equal])
    ),
    commutative: boolFromPair(
      vector(2),
      all([has.op, has.equal])
    ),
    monoid: boolFromPair(
      vector(3),
      all([has.type, has.op, has.unit, has.equal])
    ),
    semigroup: boolFromPair(
      vector(3),
      all([has.type, has.op, has.equal])
    ),
    associative: boolFromPair(
      vector(3),
      all([has.op, has.equal])
    ),
    identity: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.equal])
    ),
    leftIdentity: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.equal])
    ),
    rightIdentity: boolFromPair(
      vector(1),
      all([has.op, has.unit, has.equal])
    ),
    idempotent: boolFromPair(
      vector(1),
      all([has.f, has.equal])
    ),
    equalFor: boolFromPair(
      arrayOf(t),
      all([has.f1, has.f2, has.equal])
    )
  }

  module.exports = map(curry, ap(guards, api))
})()

