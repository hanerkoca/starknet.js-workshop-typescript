---
sidebar_position: 16
---

# Events

A contract may emit events throughout its execution. Each event contains the following fields:
- from_address: address of the contract emitting the events
- keys: a list of field elements
- data: a list of field elements

The keys can be used for indexing the events, while the data may contain any information that we wish to log.

Example of Cairo code for an event :
```rust
#[derive(Drop, starknet::Event)]
    struct EventPanic {
        #[key]
        errorType: u8,
        errorDescription: felt252,
    }
```
Here an event called `EventPanic`, with an u8 stored in keys, and a felt252 (text) in data.  
If you trigger this event with these parameters : `8, "Mega Panic."`, you will obtain these data recorded in the last block :
```typescript
contractAddress: '0x5beee10b1f4fe4dba79a11afaea452170c2c2a6e1e660f4edeb0fd3068e8a7c'
keys: [
  '0x3ba972537cb2f8e811809bba7623a2119f4f1133ac9e955a53d5a605af72bf2',
  '0x8'
] 
data: [ '0x4d6567612050616e69632e' ]
```

The first parameter in the `keys` array is a hash of the name of the event, calculated this way :

```typescript
const nameHash = num.toHex( hash.starknetKeccak("EventPanic"));
```

The second parameter is the `errorType` variable content (stored in keys array because of the `#[key]`flag in Cairo).

The `data` array contains the `errorDescription` variable content (`'0x4d6567612050616e69632e'` corresponds to encoded value of "Mega Panic.")

## Why events ?

Events are a useful tool for logging and notifying external entities about specific occurrences within a contract, with a timestamp (the block number). They emit data that can be accessed by everybody.  

Some cases :
- When a specific value is reached in a contract, an event can be created to register that it has occured at a defined block number.
- When the L1 network has triggered the execution of a L2 network contract, you can store what has appended, and when.

An event can be useful also when you invoke a contract. When you invoke a Cairo function (meaning to write in the network), the API do not authorize any response (only call functions can provide an answer). To generate an event in the code is a way to provide a response (for example for the creation of an account, an event is generated to return the account address).

## With Transaction hash

If you use Starknet.js to invoke a Cairo function that will trigger a new event, you will have as response the transaction hash. Keep it preciously ; it will be easy to read the event with it.

Example of invocation :
```typescript

```

### Raw reading

### parsed reading

## Without transaction hash

If you don't have the transaction Hash of the contract execution that created the event, it will be necessary to search inside the blocks of the Starknet blockchain. 

In this example, if you want to read the events recorded in the last 10 blocks, you need to use a method available only from an RPC node. The class `RpcProvider` is available for this case:

```typescript
import { RpcProvider } from "starknet";
const providerRPC = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545" }); // for a pathfinder node located in a PC in the local network
const lastBlock = await providerRPC.getBlock('latest');
let eventsList = await providerRPC.getEvents({
    address: myContractAddress,
    from_block: {block_number: lastBlock.block_number-9},
    to_block: {block_number: lastBlock.block_number},
    keys:[['0x3ba972537cb2f8e811809bba7623a2119f4f1133ac9e955a53d5a605af72bf2',
        '0x8']],
    chunk_size: 400
});
```

> `address, from_block, to_block, keys` are all optional parameters.

> If you don't want to filter by key, you can either remove the `keys` parameter, or affect it : `[[]]` .

> 