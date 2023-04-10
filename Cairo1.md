# Cairo 1 smart-contracts in Starknet network
![Starknet.js](/src/img/StarkNet-JS_logo.png)




## introduction

Cairo 1 is now enough mature to create and test smart-contracts in a Starknet network.  
Take advantage to use Starknet.js to deploy and use your new Cairo 1 smart-contracts.  
The Cairo 1 compiler provides an abi in the .sierra file. Today, this abi isn't fully mature, and many things are missing to have an handling similar to Cairo 0 contracts. Nevertheless, Starknet.js proposes a temporary solution for the early adopters of Cairo 1 smart-contracts.

> It's realistic to hope to have a Cairo 1 compiler providing a complete abi somewhere in May/2023.

## prerequirements:

You need to have :
- Starknet-devnet ^0.5.0.a1
- Cairo 1 installed, from Starkware repo, branch `v1.0.0-alpha.6`
- Starknet.js ^5.5.0

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
starknet-devnet --seed 0
```
You can find a little script to deploy a contract : [here](./src/scripts/cairo11-devnet/4.declareThenDeployHello.ts)

This script can be launch with :
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
And adapt in consequence the address and the private key of one of your account present in this network.

> Today, do not use declareAndDeploy() with Cairo 1. Perform the deploiement in 2 steps (declare, then deploy). Will be available soon.

## Interact with your Cairo 1 contract:

You can find a little script to interact with a contract : [here](.src/scripts/cairo11-devnet/11.CallInvokeContract.ts)

> Use CallData.compile() to prepare the parameters to send to the smart-contract. Mandatory for Cairo 1.

> Use only meta-class to interact with your contract (ex : `contract.getBalance()`)  

> With a @view function, do not forget these options for Cairo 1 : 
```typescript
{
    parseRequest: false,
    parseResponse: false,
}
```

> The answer is in an array of numbers. ex : `result[0]` for the first value.

> Debug.print() is not allowed in Starknet network.

## Questions?

Do not hesitate to report your feedback and your questions in [Discord](https://discord.com/channels/793094838509764618/927918707613786162).