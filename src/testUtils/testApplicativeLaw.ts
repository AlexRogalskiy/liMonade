import * as fc from 'fast-check';
import { InferCategory } from '../types';
import numberOperation from './numberOperation';

interface Pointed<Name> {
    of<A>(v: A): InferCategory<A, Name>;
}

export const testApplicativeLaw = <Name>(
    Testee: Pointed<Name>,
    getValue: (v: any) => any = v => v,
) => {
    describe('Applicative Functor Law', () => {
        const identity = <T>(v: T): T => v;

        it('Identity', async () =>
            fc.assert(
                fc.asyncProperty(fc.integer(), async x => {
                    expect(
                        await getValue(Testee.of(identity).ap(Testee.of(x))),
                    ).toEqual(await getValue(Testee.of(x)));
                }),
            ));

        it('Homomorphism', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    async (x, y, getFn) => {
                        const fn = getFn(y);
                        expect(
                            await getValue(Testee.of(fn).ap(Testee.of(x))),
                        ).toEqual(await getValue(Testee.of(fn(x))));
                    },
                ),
            ));

        it('Interchange', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    async (x, y, getFn) => {
                        const fn = getFn(y);
                        expect(
                            await getValue(Testee.of(fn).ap(Testee.of(x))),
                        ).toEqual(await getValue(Testee.of(x).map(fn)));
                    },
                ),
            ));

        it('composition', async () =>
            fc.assert(
                fc.asyncProperty(
                    fc.integer(),
                    fc.integer(),
                    fc.integer(),
                    numberOperation,
                    numberOperation,
                    async (x, y, z, fn1, fn2) => {
                        const u = Testee.of(fn1(y));
                        const v = Testee.of(fn2(z));
                        const w = Testee.of(x);
                        const compose = (f1: (v: any) => any) => (
                            f2: (v: any) => any,
                        ) => (value: any) => f1(f2(value));
                        expect(await getValue(u.ap(v.ap(w)))).toEqual(
                            await getValue(
                                Testee.of(compose)
                                    .ap(u)
                                    .ap(v)
                                    .ap(w),
                            ),
                        );
                    },
                ),
            ));
    });
};
