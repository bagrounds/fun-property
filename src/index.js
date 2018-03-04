/**
 *
 * @module fun-property
 */
;(() => {
  'use strict'

  /* imports */
  const { apply, lift, curry, compose, composeAll, k } = require('fun-function')
  const { arrayOf, hasFields, vector, fun, bool, tuple } = require('fun-type')
  const { map, ap } = require('fun-object')
  const { inputs, output } = require('guarded')
  const { all, and, t } = require('fun-predicate')

  /**
   *
   * @function module:fun-property.reflexive
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - (a, b) -> c
   * @param {Function} instance.t - c -> bool
   *
   * @return {Boolean} if f(x, x) is true
   */
  const reflexive = ([x], { f, t }) => t(f(x, x))

  /**
   *
   * @function module:fun-property.symmetric
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - (a, b) -> c
   * @param {Function} instance.equal - (a, b) -> bool
   *
   * @return {Boolean} if f(a, b) = f(b, a)
   */
  const symmetric = ([a, b], { equal, f }) => equal(f(a, b), f(b, a))

  /**
   *
   * @function module:fun-property.transitive
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - (a, b) -> c
   * @param {Function} instance.and - (a, b) -> c
   * @param {Function} instance.or - (a, b) -> c
   * @param {Function} instance.not - a -> b
   * @param {Function} instance.t - c -> bool
   *
   * @return {Boolean} if f(a, b) and f(b, c) implies f(a, c)
   */
  const transitive = ([a, b, c], { f, not, and, or, t }) =>
    t(or(not(and(f(a, b), f(b, c))), f(a, c)))

  /**
   *
   * @function module:fun-property.equivalent
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - (a, b) -> c
   * @param {Function} instance.and - (a, b) -> c
   * @param {Function} instance.or - (a, b) -> c
   * @param {Function} instance.not - a -> b
   * @param {Function} instance.equal - (a, b) -> bool
   * @param {Function} instance.t - a -> bool
   *
   * @return {Boolean} if f induces an equivalence relation over xs
   */
  const equivalence = ([a, b, c], { and, or, not, equal, t, f }) =>
    reflexive([a], { t, f }) &&
    symmetric([a, b], { equal, f }) &&
    transitive([a, b, c], { and, or, not, f, t })

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
   * @param {Array} xs - [a, b -> c, a -> b]
   * @param {Object} instance - to test
   * @param {Function} instance.omap - a -> F a
   * @param {Function} instance.fmap - (a -> b, F a) -> F b
   * @param {Object} instance.idS - a -> a
   * @param {Object} instance.equalT - (F, F) -> Bool
   *
   * @return {Boolean} if (fmap f . g = fmap f . fmap g) and (fmap idS  = idT)
   */
  const functor = ([x, f, g], {omap, fmap, idS, equalT}) => (fmap =>
    equalFor([x], {
      equal: equalT,
      f1: compose(fmap(idS), omap),
      f2: compose(omap, idS)
    }) &&
    equalFor([x], {
      equal: equalT,
      f1: compose(fmap(compose(f, g)), omap),
      f2: composeAll([fmap(f), fmap(g), omap])
    }))(curry(fmap))

  /**
   *
   * @function module:fun-property.monad
   *
   * @param {Array} xs - [a, c -> M d, b -> M c, a -> M b]
   * @param {Object} instance - to test
   * @param {Function} instance.of - a -> M a
   * @param {Function} instance.chain - (a -> M b, M a) -> M b
   * @param {Object} instance.equal - (M, M) -> Bool
   *
   * @return {Boolean} instance is a monoid over kleisli arrows
   */
  const monad = ([x, f, g, h], {chain, of, equal}) => monoid(
    [f, g, h], {
      op: (f1, f2) => compose(curry(chain)(f2), f1),
      unit: k(of),
      type: fun,
      equal: (f1, f2) => equalFor([x], { f1, f2, equal })
    })

  /**
   *
   * @function module:fun-property.comonad
   *
   * @param {Array} xs - [W a, W c -> d, W b -> c, W a -> b]
   * @param {Object} instance - to test
   * @param {Function} instance.extract - W a -> a
   * @param {Function} instance.extend - (W a -> b, W a) -> W b
   * @param {Object} instance.equal - (a, a) -> Bool
   *
   * @return {Boolean} instance is a monoid over cokleisli arrows
   */
  const comonad = ([x, f, g, h], {extend, extract, equal}) => monoid(
    [f, g, h], {
      op: (f1, f2) => compose(f2, curry(extend)(f1)),
      unit: k(extract),
      type: fun,
      equal: (f1, f2) => equalFor([x], { f1, f2, equal })
    })

  /* exports */
  const api = { functor, category, abelianGroup, group, inverse, leftInverse,
    rightInverse, commutative, monoid, semigroup, identity, leftIdentity,
    rightIdentity, closed, associative, idempotent, equalFor, monad, comonad,
    reflexive, transitive, symmetric, equivalence }

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

    return { op, unit, equal, inverse, omap, fmap, type, f, f1, f2 }
  })()

  const toBool = input => compose(inputs(input), output(bool))
  const boolFromPair = (a, b) => toBool(tuple([a, b]))

  const guards = {
    functor: boolFromPair(
      tuple([t, fun, fun]),
      hasFields({ omap: fun, fmap: fun, idS: fun, equalT: fun })
    ),
    monad: boolFromPair(
      tuple([t, fun, fun, fun]),
      hasFields({ chain: fun, of: fun, equal: fun })
    ),
    comonad: boolFromPair(
      tuple([t, fun, fun, fun]),
      hasFields({ extend: fun, extract: fun, equal: fun })
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
    ),
    reflexive: boolFromPair(
      vector(1),
      hasFields({ f: fun, t: fun })
    ),
    symmetric: boolFromPair(
      vector(2),
      hasFields({ f: fun, equal: fun })
    ),
    transitive: boolFromPair(
      vector(3),
      hasFields({ f: fun, or: fun, and: fun, not: fun, t: fun })
    ),
    equivalence: boolFromPair(
      vector(3),
      hasFields({ f: fun, or: fun, and: fun, not: fun, t: fun, equal: fun })
    )
  }

  module.exports = map(curry, ap(guards, api))
})()

