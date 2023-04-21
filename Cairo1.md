# Cairo 1 smart-contracts in Starknet network
![Starknet.js](/src/img/StarkNet-JS_logo.png)




## introduction

Cairo 1 is now enough mature to create and test smart-contracts in a Starknet network.  
Take advantage to use Starknet.js to deploy and use your new Cairo 1 smart-contracts.  
The Cairo 1 compiler provides an abi in the .sierra file. Today, this abi isn't fully mature, and many things are missing to have an handling similar to Cairo 0 contracts. Nevertheless, Starknet.js proposes a temporary solution for the early adopters of Cairo 1 smart-contracts.

> It's realistic to hope to have a Cairo 1 compiler providing a complete abi somewhere in May/2023.

## prerequirements:

You need to have :
- Starknet-devnet ^0.5.0 [here](https://github.com/Shard-Labs/starknet-devnet/releases/tag/v0.5.0).
- Cairo 1 installed, from Starkware repo, branch `v1.0.0-alpha.6` [here](https://github.com/starkware-libs/cairo/tree/v1.0.0-alpha.6).
- Starknet.js ^5.6.0 [here](https://github.com/0xs34n/starknet.js/tree/v5.6.0).

## compilation of Cairo 1:
We will use a small Cairo 1 smart-contract, available [here](./contracts/Cairo1Test/test_type1.cairo) .

### compile the .cairo file:

Go in your cairo directory, launch the compiler (adapt the path to your config):

```bash
cd cairo
cargo run --bin starknet-compile -- ../contracts/test_type1.cairo ../out/test_type1.sierra
```

### compile the .sierra file:

```bash
cargo run --bin starknet-sierra-compile -- ../out/test_type1.sierra ../out/test_type1.casm
```

## Deploy a Cairo 1 contract with Starknet.js:

Launch starknet-devnet with this option :
```
starknet-devnet --seed 0 --timeout 5000
```
You can find 2 little scripts to deploy a contract : 
- one to declare and deploy in 2 steps [here](./src/scripts/cairo11-devnet/4.declareThenDeployHello.ts).
- one to declare and deploy in 1 step [here](./src/scripts/cairo11-devnet/4b.declareAndDeployHello.ts).

The first script can be launched with :
```bash
npx ts-node src/scripts/cairo11-devnet/4.declareThenDeployHello.ts
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

You can find this contract already deployed in testnet and testnet 2 :
- Testnet address : 0x697d3bc2e38d57752c28be0432771f4312d070174ae54eef67dd29e4afb174
- Testnet 2 address : 0x299d68d537a860025749248411d69eff49d7b4b121ef7ec69e7fc470851b4ae

## Interact with your Cairo 1 contract:

You can find a little script to interact with a Cairo 1 contract : [here](./src/scripts/cairo11-devnet/11.CallInvokeContract.ts)

Now, you have 2 ways to exchange data with Starknet :

### For compatible types of data :

u8, u16, u32, usize, u64, u128, ContractAddress are compatible.  
Tuple, struct and array (made of predefined type) are compatible.  
In this case, use this code :
```typescript
const res = await myTestContract.test1(100) // send a felt252
    console.log("res1 =", res); // felt252 -> bigint
```

### For not yet compatible types :

u256, complex objects, some mix of types are not yet compatible.
In this case, follow these rules (valid for all types, including compatible ones) :

> Use CallData.compile() to prepare the parameters to send to the smart-contract. 

> Use only meta-class to interact with your contract (ex : `contract.getBalance()`)  

> For a @view function, do not forget these options for Cairo 1 : 
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
const tx = await myTestContract.increase_balance(
CallData.compile({
        amount: 100,
    })
    );
console.log("res1 =", res1[0]); // Hex string
```

> Debug.print() is not allowed in Starknet network.

## Questions?

Do not hesitate to report your feedback and your questions in [Discord](https://discord.com/channels/793094838509764618/927918707613786162).
