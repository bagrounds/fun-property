/**
 *
 * @module fun-property
 */
;(function () {
  'use strict'

  /* imports */
  var fn = require('fun-function')
  var type = require('fun-type')
  var object = require('fun-object')
  var guarded = require('guarded')
  var predicate = require('fun-predicate')

  var api = {
    functor: functor,
    category: category,
    abelianGroup: abelianGroup,
    group: group,
    inverse: inverse,
    leftInverse: leftInverse,
    rightInverse: rightInverse,
    commutative: commutative,
    monoid: monoid,
    semigroup: semigroup,
    identity: identity,
    leftIdentity: leftIdentity,
    rightIdentity: rightIdentity,
    closed: closed,
    associative: associative,
    idempotent: idempotent
  }

  var guards = {
    functor: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          omap: type.fun,
          fmap: type.fun,
          fromCat: type.hasFields({
            op: type.fun,
            unit: type.fun,
            equal: type.fun
          }),
          toCat: type.hasFields({
            op: type.fun,
            unit: type.fun,
            equal: type.fun
          })
        })
      ]),
      type.bool
    ),
    closed: guarded(
      type.tuple([
        type.vector(2),
        type.hasFields({
          type: type.fun,
          op: type.fun
        })
      ]),
      type.bool
    ),
    category: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    abelianGroup: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          type: type.fun,
          op: type.fun,
          unit: type.fun,
          inverse: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    group: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          type: type.fun,
          op: type.fun,
          unit: type.fun,
          inverse: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    inverse: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          inverse: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    leftInverse: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          inverse: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    rightInverse: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          inverse: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    commutative: guarded(
      type.tuple([
        type.vector(2),
        type.hasFields({ op: type.fun, equal: type.fun })
      ]),
      type.bool
    ),
    monoid: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          type: type.fun,
          op: type.fun,
          unit: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    semigroup: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          type: type.fun,
          op: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    associative: guarded(
      type.tuple([
        type.vector(3),
        type.hasFields({
          op: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    identity: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    leftIdentity: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    rightIdentity: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          op: type.fun,
          unit: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    ),
    idempotent: guarded(
      type.tuple([
        type.any,
        type.hasFields({
          f: type.fun,
          equal: type.fun
        })
      ]),
      type.bool
    )
  }

  /* exports */
  module.exports = object.map(fn.curry, object.ap(guards, api))

  // eslint-disable-next-line max-params
  function equalFor (eq, i, f1, f2) {
    return fn.lift(eq)(f1)(f2)(i)
  }

  /**
   *
   * @function module:fun-property.functor
   *
   * @param {Array} xs - inputs to test instance with
   * @param {Object} i - instance to test
   * @param {Function} instance.omap - maps objects
   * @param {Function} instance.fmap - maps functions
   * @param {Function} instance.fromCat - source category
   * @param {Function} instance.toCat - destination category
   *
   * @return {Boolean} if i is a functor mapping fromCat -> toCat
   */
  function functor (xs, i) {
    var id = i.fromCat.op.bind(null, i.fromCat.unit())
    var f = i.fromCat.op.bind(null, xs[1])
    var g = i.fromCat.op.bind(null, xs[2])

    return equalFor(
      i.toCat.equal,
      xs[0],
      fn.compose(i.fmap(id), i.omap),
      fn.compose(i.omap, id)
    ) &&
    equalFor(
      i.toCat.equal,
      xs[0],
      fn.composeAll([i.fmap(f), i.fmap(g), i.omap]),
      fn.composeAll([i.omap, f, g])
    )
  }

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
  function closed (xs, instance) {
    return type.arrayOf(instance.type, xs) &&
      instance.type(instance.op(xs[0], xs[1]))
  }

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
  function abelianGroup (xs, instance) {
    return predicate.and(
      group.bind(null, xs),
      commutative.bind(null, xs.slice(0, 2))
    )(instance)
  }

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
  function category (xs, instance) {
    return predicate.and(
      associative.bind(null, xs),
      identity.bind(null, xs[0])
    )(instance)
  }

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
  function group (xs, instance) {
    return predicate.and(
      monoid.bind(null, xs),
      inverse.bind(null, xs[0])
    )(instance)
  }

  /**
   *
   * @function module:fun-property.inverse
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> -x) = (-x <> x) = x
   */
  function inverse (x, instance) {
    return predicate.and(
      leftInverse.bind(null, x),
      rightInverse.bind(null, x)
    )(instance)
  }

  /**
   *
   * @function module:fun-property.rightInverse
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> -x) = ()
   */
  function rightInverse (x, instance) {
    return instance.equal(
      instance.op(x, instance.inverse(x)),
      instance.unit()
    )
  }

  /**
   *
   * @function module:fun-property.leftInverse
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.inverse - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (-x <> x) = ()
   */
  function leftInverse (x, instance) {
    return instance.equal(
      instance.op(instance.inverse(x), x),
      instance.unit()
    )
  }

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
  function commutative (xs, instance) {
    return instance.equal(
      instance.op(xs[0], xs[1]),
      instance.op(xs[1], xs[0])
    )
  }

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
  function monoid (xs, instance) {
    return predicate.and(
      semigroup.bind(null, xs),
      identity.bind(null, xs[0])
    )(instance)
  }

  /**
   *
   * @function module:fun-property.identity
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (() <> x) = (x <> ()) = x
   */
  function identity (x, instance) {
    return predicate.and(
      leftIdentity.bind(null, x),
      rightIdentity.bind(null, x)
    )(instance)
  }

  /**
   *
   * @function module:fun-property.leftIdentity
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (() <> x) = x
   */
  function leftIdentity (x, instance) {
    return instance.equal(instance.op(instance.unit(), x), x)
  }

  /**
   *
   * @function module:fun-property.rightIdentity
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.op - (x, x) -> x
   * @param {Function} instance.unit - () -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if (x <> ()) = x
   */
  function rightIdentity (x, instance) {
    return instance.equal(instance.op(x, instance.unit()), x)
  }

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
  function semigroup (xs, instance) {
    return predicate.and(
      closed.bind(null, xs.slice(0, 2)),
      associative.bind(null, xs)
    )(instance)
  }

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
  function associative (xs, instance) {
    return instance.equal(
      instance.op(instance.op(xs[0], xs[1]), xs[2]),
      instance.op(xs[0], instance.op(xs[1], xs[2]))
    )
  }

  /**
   *
   * @function module:fun-property.idempotent
   *
   * @param {*} x - input to test instance with
   * @param {Object} instance - to test
   * @param {Function} instance.f - x -> x
   * @param {Function} instance.equal - (x, x) -> bool
   *
   * @return {Boolean} if f(x) = f(f(x))
   */
  function idempotent (x, instance) {
    return equalFor(
      instance.equal,
      x,
      instance.f,
      fn.iterate(2, instance.f)
    )
  }
})()

