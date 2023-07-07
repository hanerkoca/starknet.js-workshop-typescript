From Cairo v2.0 (implemented in Cairo-lang v0.12.0), the abi Json lists enum definitions.  
Enums are authorized both as input and response of a contract function.  
**Here is a proposal how to handle these enums, from a user point of view :**

We have 3 types of enums :

## enums defined by the dev, in the contract :

Example :
```rust
#[derive(Copy, Drop, Serde)]
enum MyEnum {
    Response: Order,
    Warning: felt252,
    Error: u16,
}

```
abi :
```json
{
    "type": "enum",
    "name": "PhilTest2::PhilTest2::MyEnum",
    "variants": [
    {
        "name": "Response",
        "type": "PhilTest2::PhilTest2::Order"
    },
    {
        "name": "Warning",
        "type": "core::felt252"
    },
    {
        "name": "Error",
        "type": "core::integer::u16"
    }
    ]
},
```
As Cairo enums are significantly different to Javascript/Typescript ones (and are similar to Rust enum), users will have to create an object to handle their specific enums in JS :  
To send a specific enum :
```typescript
type Order = {p1: BigNumberish, p2: BigNumberish};
type MyEnum = {
Result: Order,
Warning: BigNumberish,
Error: BigNumberish}
const enum1:MyEnum= {Warning: 234}
const txh = myContract.analyse_data(enum1);
```

To receive as result a specific enum, the user will receive an object of this type :
```typescript
const myEnum = myContract.perform_transfer(100); // return a MyEnum<Order> enum
```
myEnum will be (if the function succeed) of type :
```typescript
{
    Result: {p1: bigint, p2: bigint},
    Warning: undefined,
    Error: undefined
}
```

## core enums that are authorized in Cairo contract function signatures :
Today only `Option` enum is implemented in core of Cairo.
```rust
fn test3(self: @ContractState, val1: u8) -> Option<u8> {
    if val1 < 100 {
        return Option::None(());
    }
    Option::Some(val1 + 1)
}
```
abi :
```json
{
    "type": "enum",
    "name": "core::option::Option::<core::integer::u8>",
    "variants": [
    {
        "name": "Some",
        "type": "core::integer::u8"
    },
    {
        "name": "None",
        "type": "()"
    }
    ]
},
```
As this enum is very common in Cairo, it should be useful for users to have in JS/TS a Class dedicated for it, proposed by Starknet.js. This class can propose the most common methods proposed by Cairo for this enum   :  
```typescript
class MyOption<T> {
    readonly Some?: T;
    readonly None?: boolean;

    constructor(option: CairoOption, input: BigNumberish[], DeserealizeSome: Function,) {
        const input3: bigint[] = input.map(val => BigInt(val));
        switch (option) {
            case 0:
                this.Some = DeserealizeSome(input3) as T;
                break;
            case 1:
                this.None = true;
                break;
            default:
                throw new Error("option is out of range.")
                break;
        }
    }
    public isSome(): boolean {
        return !((typeof this.Some) === "undefined")
    }
    public isNone(): boolean {
        return this.None === true
    }
    public unwrap(): T | undefined { return this.Some }
}
enum CairoOption {
    Some = 0,
    None = 1,
}
const DeserializeBigint = (input: bigint[]): bigint => { return input[1] };
```
If users want to send an Option (not the most common case), they could create it this way :
```typescript
const DeserializeOrder = (input: bigint[]): Order => { return { p1: input[0], p2: input[1] } };
const op1: Order = { p1: 11, p2: 12 };
const myOption1 = new MyOption<Order>(CairoOption.Some, CallData.compile(op1), DeserializeOrder);
// or
const myOption2 = new MyOption<Order>(CairoOption.None,[], DeserializeOrder);
```

and then use myOption1/2 as parameter in starknet.js.  
If users are waiting an Option as response, it should be useful that Starknet.js provides an Option class instance :

```typescript
const myOption = myContract.perform_transfer(100); // return an Option<Order> enum
```
Then they can use the methods of the class to work with the Option, in a very similar way  than in Cairo :

```typescript
if (myOption.isSome()) {const myOrder:Order = myOption.unwrap() as Order}
```

## core enums that are not yet authorized in Cairo contract function signatures :
 One core Cairo enum is not yet authorized  :  
'Result` has been identified as an enum that will be authorized soon.

```rust
fn test7(self: @ContractState, val1: u16) -> Result<Order, u16> {
    if val1 < 100 {
        return Result::Err(14);
    }
    Result::Ok(Order { p2: val1, p1: 8 })
}
```
abi :
```json
{
    "type": "enum",
    "name": "core::result::Result::<core::integer::u16, core::integer::u16>",
    "variants": [
    {
        "name": "Ok",
        "type": "core::integer::u16"
    },
    {
        "name": "Err",
        "type": "core::integer::u16"
    }
    ]
},
```

As for Option, this enum is very common in Cairo ; it should be useful for users to have in JS/TS a Class dedicated for it, proposed by Starknet.js. This class can propose the most common methods proposed by Cairo for this enum :
```typescript
enum CairoResult {
    Ok = 0,
    Err = 1,
}

class MyResult<T, U> {
    readonly Ok?: T;
    readonly Err?: U;

    constructor(option: CairoResult, input: BigNumberish[], DeserealizeOk: Function, DeserializeErr: Function) {
        const input3: bigint[] = input.map(val => BigInt(val));
        switch (option) {
            case CairoResult.Ok:
                this.Ok = DeserealizeOk(input3) as T;
                break;
            case CairoResult.Err:
                this.Err = DeserializeErr(input3) as U;
                break;
            default:
                throw new Error("option is out of range.")
                break;
        }
    }
    public isOk(): boolean {
        return !((typeof this.Ok) === "undefined")
    }
    public isErr(): boolean {
        return !((typeof this.Err) === "undefined")
    }
    public unwrap(): T | undefined { return this.Ok }
}
const DeserializeBigint = (input: bigint[]): bigint => { return input[1] };

```

If users want to send a Result (probably not the most common case), they could create it this way :

```typescript
const re1: Order = { p1: 21, p2: 110 };
const myResult1 = new MyResult<Order, bigint>(CairoResult.Ok, CallData.compile([re1]), DeserializeOrder, DeserializeBigint);
//or
const re2: bigint = 2n;
const myResult2 = new MyResult<Order, bigint>(CairoResult.Err, CallData.compile([re2]), DeserializeOrder, DeserializeBigint);
```
and then use myResult1/2 as parameter in Starknet.js.  
If users are waiting a Result as response, it should be useful that Starknet.js provides a Result class instance :

```typescript
const myResult = myContract.perform_withdraw(100); // return a Result<Order> enum
```
Then they can use the methods of the class to work with the Result, in a very similar way  than in Cairo :


```typescript
if (myResult.isOk()){
    const myOrder = myResult.unwrap() as Order;
} else {
    throw new Error("Error",myResult.err);
}
```

>**Nota** : All this code is for TypeScript. To see if it's compatible with JS.
