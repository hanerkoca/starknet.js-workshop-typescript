# Cairo 1&2 smart-contracts in Starknet network
![Starknet.js](/src/img/StarkNet-JS_logo.png)




## Introduction

Take advantage to use Starknet.js to deploy and use your new Cairo 1&2 smart-contracts.  
The Cairo compiler provides an abi in the .sierra.json file. Today, this abi isn't fully mature, and some things are missing to have an handling similar to Cairo 0 contracts. Nevertheless, Starknet.js proposes a temporary solution for the early adopters of Cairo 1&2 smart-contracts.

> It's realistic to hope to have a Cairo compiler providing a complete abi somewhere in ~~May/2023~~ 2023.

## Prerequirements:

You need to have :
- Starknet-devnet ^0.5.5 [here](https://github.com/Shard-Labs/starknet-devnet/releases/tag/v0.5.5).
- Cairo installed, from Starkware repo, branch `v2.0.0` [here](https://github.com/starkware-libs/cairo/tree/v2.0.0).
- Starknet.js ^5.16.0 [here](https://github.com/0xs34n/starknet.js/tree/v5.16.0).

## Compilation of Cairo 1&2:
We will use a small Cairo smart-contract, available [here]([label](contracts/cairo200/PhilTest2.cairo)).

### compile the .cairo file:

Go in your cairo directory, launch the compiler (adapt the path to your config):

```bash
cd cairo
cargo run --bin starknet-compile -- ../contracts/cairo200/PhilTest2.cairo ../out/cairo200/PhilTest2.sierra.json
```

### compile the .sierra file:

```bash
cargo run --bin starknet-sierra-compile -- ../out/cairo200/PhilTest2.sierra.json ../out/cairo200/PhilTest2.casm.json
```

## Deploy a Cairo 1&2 contract with Starknet.js:

Launch starknet-devnet with this option :
```
starknet-devnet --seed 0
```
You can find 2 little scripts to deploy a contract : 
- one to declare and deploy in 2 steps [here](./src/scripts/cairo11-devnet/4.declareThenDeployTest.ts).
- one to declare and deploy in 1 step [here](./src/scripts/cairo11-devnet/4b.declareAndDeployTest.ts).

The first script can be launched with :
```bash
npx ts-node src/scripts/cairo11-devnet/4.declareThenDeployTest.ts
```
You can easily change the network to use :
- Testnet :
```typescript
const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
```
- Testnet-2 : 
```typescript
const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
```
And adapt in consequence the address and the private key to one of your account present in this network.

You can find this contract already deployed in testnet  :
- Testnet address : 0x033de869eb1905fe503610527c51e245119bd05c231e7165c95d6fb630fe05ff

## Interact with your Cairo 1&2 contract:

You can find a little script to interact with a Cairo 1 contract : [here](./src/scripts/cairo11-devnet/11.CallInvokeContract.ts)

Now, you have 2 ways to exchange data with Starknet :

### For compatible types of data :

bool, u8, u16, u32, usize, u64, u128, u256, ContractAddress are compatible.  
Tuple, struct and array (made of literal types) are compatible.  
In this case, use this code :
```typescript
const res = await myTestContract.test1(100) // send a felt252
    console.log("res1 =", res); // felt252 -> bigint
```

### For not yet compatible types :

Complex objects, enums(`Option` or custom), some mix of types are not yet compatible.
In this case, follow these rules (valid for all types, including compatible ones) :

> Use CallData.compile() to prepare the parameters to send to the smart-contract. 

> Use only meta-class to interact with your contract (ex : `contract.getBalance()`)  

> For a @view function, do not forget these options for Cairo : 
```typescript
{
    parseRequest: false,
    parseResponse: false,
}
```

> The answer is in an array of Hex numbers. ex : `result[0]` for the first value. An array returns the size, then the elements. An Uint256 returns 2 numbers (low,high).

Ex :
```typescript
const par1 = CallData.compile({ balance: 100 }) 
const res1 = await myTestContract.test1(par1, { parseRequest: false, parseResponse: false, });
const tx = await myTestContract.increase_counter(
CallData.compile({
        amount: 100,
    })
    );
console.log("res1 =", res1[0]); // Hex string
```

## Debug

Debug.print() is not allowed in Cairo 1&2 code for Starknet network.

Hereafter is a way to debug anyway your Cairo contract, but a specific configuration is necessary :

### Compilation 

You need a customized `lib_funcs.json` file in your project.  
The original file is in the Starkware repo : [here](https://github.com/starkware-libs/cairo/blob/main/crates/cairo-lang-starknet/src/allowed_libfuncs_lists/audited.json).
You have to insert a line with `"print",`, like this :
```json
{
    "allowed_libfuncs": [
        "print",
        "alloc_local",
        "array_append",
        "array_get",
        "array_len",
        ...
```

My `lib_funcs.json` is [here](contracts/hello/lib_funcs.json).

We will test the print function with this small example (available [here](contracts/hello/hello.cairo)) :
```rust
#[external(v0)]
    impl HelloContract of super::IHelloContract<ContractState> {
        fn Say_HelloPhil126(ref self: ContractState, message: felt252) {
            let caller = get_caller_address();
            self.emit(Hello { from: caller, value: message }); // event

            'Hello, Philippe!'.print();
            123.print();
            message.print();
        }
    }
```
> Note the last lines, with the `.print()` command. The following commands are operational :
```rust
'Hello, Philippe!'.print();
123.print();
let a:u32 = 200;
a.print();
```

The compilation of the .cairo file needs some extra options :

```bash
cargo run --bin starknet-compile -- --allowed-libfuncs-list-file ./pathto/lib_funcs.json ./src/hello/hello.cairo ./out/hello/hello.sierra.json
```
> Of course, adapt `pathto` to your config.

Same thing to compile the .sierra :

```bash
cargo run --bin starknet-sierra-compile -- --allowed-libfuncs-list-file ./pathto/lib_funcs.json ./out/hello/hello.sierra.json  ../out/hello/hello.casm.json 
```

### Devnet

Launch Starknet-devnet with these options :
```bash
starknet-devnet --seed 0 --compiler-args '--allowed-libfuncs-list-file ./pathto/lib_funcs.json --add-pythonic-hints' 2> /dev/null &
``` 
> Note the PID of process, displayed in the first line (ex : `[1] 954825`). It will be necessary at the end of the process.

### Interact with the contract :

In the **SAME** bash window, launch the Starknet.js script that will deploy and interact with the contract (available [here](src/scripts/cairo11-devnet/4c.declareAndDeployHello.ts)) :
```bash
npx ts-node src/scripts/cairo11-devnet/4c.declareAndDeployHello.ts
```

This script includes :
```typescript
const th = await myTestContract.Say_HelloPhil126(200);
```
The following answer is printed in the bash window :
`96231036770510887785732922765483205921`

It can be decoded with this Starknet.js command :
```typescript
console.log("Decoded message =", shortString.decodeShortString("96231036770510887785732922765483205921"));
```
(script available [here]([label](src/scripts/decodeError.ts)))

And the answer is : `Hello, Philippe!`

> Do not forget to kill the process of Devnet when you have ended to work with it (ex : `kill 954825`).

So, we can debug a Starknet Cairo 1 contract in Devnet with this process.

## Questions?

Do not hesitate to report your feedback and your questions in [Discord](https://discord.com/channels/793094838509764618/927918707613786162).
