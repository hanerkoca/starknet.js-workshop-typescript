# Interact with the ETH ERC20 contract

Many people have serious difficulties just to answer to the question :  
"How many ETH in this account?"  
Most of the time, they are not able to manage the proxy of the ETH ERC20 (even if they are aware of its existence).  
So lets explain how is working this ETH ERC20.

## Proxy :

To use a proxy is complicating everything, but it's a convenient way for administrators to easily update the contract code.  
The ETH contract with proxy is constituted of :
- a proxy class : owns the code to manage the proxy (class hash : 0x00d0e183745e9dae3e4e78a8ffedcce0903fc4900beace4e0abf192d4c202da3)
- a proxy implementation : owns the storage of the contract ; its deployment address is the address of the ETH contract (deployment address : 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7)
- an ERC20 class : owns the code of the ERC20 (class hash : 0x000fa904eea70850fdd44e155dcc79a8d96515755ed43990ff4e7e7c096673e7)

Each class has it own ABI. So, you have an ABI for the proxy, and an other one for the ETH ERC20. This is generating so much troubles to newbies...

## How it works :

![Starknet.js](/src/img/proxy.png)
We will follow a balanceOf() request to the ETH contract :
1. Starknet.js is calling the function `balanceOf()`, at Proxy contract address, using the ABI of the ERC20 class.
2. The proxy implementation recognizes that it's not one of its administration functions.
3. The proxy implementation is just transferring the call to the ERC20 class.
4. The ERC20 call is processing in the ERC20 class, using the storage of the proxy implementation.
5. The ERC20 class is answering to the proxy implementation.
6. The proxy implementation is just receiving the answer.
7. The proxy implementation is transferring the answer to Starknet.js


> What is really happening under the hood is not exactly what has been described above, but it's a very good way to understand how to use a proxy contract.

## Recover necessary data for Starknet.js :

Starknet.js needs 2 things : 
- The address of the proxy implementation. It's the ETH contract address, so you have it from the beginning.
- The abi of the ERC20 class. This is the tricky part. Either you have already it stored somewhere, or you have to recover it in Starknet.

The procedure for recovery of ERC20 ABI in Starknet :
- Recover the ABI of the proxy class.
- Use this ABI to read the implementation.
- Generally, the implementation contains the ERC20 class hash. But for the ETH contract, the proxy is storing the address of an ERC20 implementation. Don't ask me why ; I know it's stupid.
- So we have an additional step specific for ETH, recover the class hash related to this ERC20 implementation address.
- With this ERC20 class hash, we have to recover the ABI of the ERC20 class.

## interact with the proxy contract :

If you have already the ABI of the ERC20 class, it's very easy to interact with the ETH contract :
```typescript
const ETHproxyAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"; 
    const compiledERC20 = json.parse(fs.readFileSync("./compiledContracts/erc20ETH.json").toString("ascii"));
    const ethContract = new Contract(compiledERC20.abi, ETHproxyAddress, provider);
    console.log('ETH Contract connected at =', ethContract.address);

    // Interactions with the contract
    const bal = await ethContract.balanceOf("0x3ed25d84463bc077196174405644a845b52b7ea25534cccb7f351a1a5047926");
```

The full script [here](src/scripts/13a.ETHproxyFast.ts).

If you need to recover the abi in Starknet :

```typescript
const ETHproxyAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"; // address of ETH proxy
    const compiledProxy = await provider.getClassAt(ETHproxyAddress); // abi of proxy
    const proxyContract = new Contract(compiledProxy.abi, ETHproxyAddress, provider);
    const {address:implementationAddress} = await proxyContract.implementation(); 
    // specific to this proxy : Implementation() returns an address of implementation.
    // Other proxies returns generaly a class hash of implementation
    console.log("implementation ERC20 Address =", num.toHex(implementationAddress));
```
Specificaly for this proxy :
```typescript
    const classHashERC20Class=await provider.getClassHashAt(num.toHex(implementationAddress)); // read the class hash related to this contract address.
    console.log("classHash of ERC20 =",classHashERC20Class);
```
And finally :
```typescript
    const compiledERC20 = await provider.getClassByHash(classHashERC20Class); // final objective : the answer contains the abi of the ERC20.
    fs.writeFileSync('./compiledContracts/erc20ETH.json', json.stringify(compiledERC20, undefined, 2));

    const ethContract = new Contract(compiledERC20.abi, ETHproxyAddress, provider);
    console.log('ETH Contract connected at =', ethContract.address);

    // Interactions with the contract
    const bal = await ethContract.balanceOf("0x3ed25d84463bc077196174405644a845b52b7ea25534cccb7f351a1a5047926");
```

The complete script is [here](src/scripts/13.ETHproxy.ts)
