# Maxime

Maxime is a programming language. It comes with compiler to JavaScript.

The goal of Maxime is to help the developer write programs which

* Contain less errors
* Are easier to read and understand

than JavaScript programs.

## Available features

* No `null` or `undefined` (use the `Option` class instead)
* Structural pattern matching

## Planned features

* Static type checking
* Type inference
* Parameterized types

## Code examples

Functor class:

```
class Functor[f]
  def map (functor: f[a], func: a -> b) -> f[b]
```

List class:

```
class List[a] is Functor

  // Constructors
  Cons(head: a, tail: List[a])
  Nil()
  
  // Functions supported by this class
  def map (list: List[a], f: a → b) → List[b] =
    list match
      case Cons(head, tail) => Cons(f(head), map(tail, f))
      case Nil() => Nil()

  def head (list: List[a]) → a = list.head

  def tail (list: List[a]) → List[a] = list.tail

  def concat (l1: List[a], l2: List[a]) → List[a] =
    l1 match
      case Nil() => l2
      case Cons(head, tail) => Cons(head, concat(tail, l2))

  def length (l: List[a]) → Num =
    l match
      case Nil() => 0
      case Cons(head, tail) => 1 + length(tail)

  def join (l: List[a], sep: String) → String =
    l match
      case Nil() => ""
      case Cons(head, Nil()) => toString(head)
      case Cons(head, tail) => toString(head) + sep + join(tail, sep)
```

Option class:

```
class Option[a] is Functor[a]
  None()
  Some(a:a)
  
  def map (o: Option[a], f: a -> b) -> Option[b] =
    o match
      case Some(s) => Some(f(s))
      case None() => None()
```