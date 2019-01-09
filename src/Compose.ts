import { Applicative } from './types';

export interface Pointed<Kind> {
    of<T>(v: T): Applicative<T, Kind, Kind>;
}

// The functor that compose functors.
// It allows to operate on a value nested in two functors `Functor(Functor(value))`.
// Needed to test Traversable law. You will probably never use it.
const createCompose = <K1, K2>(F: Pointed<K1>, G: Pointed<K2>) => {
    class Compose<Value> implements Applicative<Value, 'Compose'> {
        public static of<Value>(value: Value): Compose<Value> {
            return new Compose(F.of(G.of(value)));
        }
        public readonly kind = 'Compose';
        public readonly name = 'Compose';
        private readonly value: Applicative<Applicative<Value, K2>, K1>;
        constructor(value: Applicative<Applicative<Value, K2>, K1>) {
            this.value = value;
        }
        public map<A, B>(this: Compose<A>, fn: (v: A) => B): Compose<B> {
            return new Compose(this.value.map(x => x.map(fn)));
        }
        public ap<A, B>(
            this: Compose<(v: A) => B>,
            other: Compose<A>,
        ): Compose<B> {
            return this.map(fn => other.map(fn).value);
        }
    }
    return Compose;
};

export default createCompose;
