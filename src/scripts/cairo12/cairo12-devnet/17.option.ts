// Rust Option like for Typescript
// launch with : npx ts-node src/scripts/cairo12/cairo12-devnet/17.option.ts
// Coded with Starknet.js v5.21.0



interface Switchable<T> {
    switch<E>(fts: { some: (t: T) => E, none: () => E }): E;
}

export interface Somee<T> {
    tag: "some"
    value: T
}

export interface Nonee {
    tag: "none"
}

export type Optione<T> = (Somee<T> | Nonee) & Switchable<T>

export namespace Option {
    
    class Some<T> implements Somee<T> {
        public tag: "some" = "some"
        public value: T

        public constructor(val: T) {
            this.value = val
        }
    }

    class None implements Nonee {
        public tag: "none" = "none"
    }

    export function none(): None {
        return new None()
    }

    export function of<T>(val: T): Optione<T> {
        if (val === null || val === undefined) {
            return Option.none()
        }
        return new Some(val)
    }

}

const val:number=23;
//const val: string = "abc";
const maybe = Option.of(val);
const maybe2 = Option.of(null);
console.log("maybe=", maybe, maybe2);
maybe.switch({
    some(num:number){console.log("some=",num)},
    none(){console.log("problem")}
})

