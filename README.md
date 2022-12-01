# Starkware Starknet network ^0.13.0
# Cairo Accounts and ERC20 Demo 
# Typescript code, using starknet.js and local Starknet-devnet 


If you want to implement the Starknet network in your DAPP, you can use starknet.js to interact with it.
 
These little scripts shows how to use and test very quickly your starknet.js code without any user interface.

Even if these codes are very small, it's a good guideline to always write them in Typescript.

Starknet mainnet and testnet are (very) slow. To speed up the execution, we use Starknet-devnet, that create a local Starknet network.

## 🛠️ Installation 🛠️

copy this repo to your local disk.
Use `cd starknet.js-workshop-typescript` to go to the root of the project.

If necessary :

- Install latest LTS version of node [here](https://kinsta.com/blog/how-to-install-node-js/#how-to-install-nodejs-on-linux)
- Install Python 3.9  [here](https://linuxize.com/post/how-to-install-python-3-9-on-ubuntu-20-04/)
- Create a Starknet environment [here](https://starknet.io/docs/quickstart.html), with cairo 0.13.0 minimum.
- Install Starknet-devnet  [here](https://shard-labs.github.io/starknet-devnet/docs/intro)
  
Run `npm install` in this directory.

The file .env defines the network to use. It's currently configured for the local devnet. As explained in the file, you can change easily to Testnet (1 or 2) or Mainnet.

This repo is configured to be able to perform debugging of your typescript code. Just CTRL+SHIFT+D, then click on the green arrow.

This script has been written with cairo v0.10.3, starknet-devnet v0.4.0, starknet.js v4.14.0. Due to fast iterations of Starknet and Cairo, this script will probably be quickly out-of-date.



The Account contract used in this workshop is made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts), contract version 0.5.0.

##  🚀 Start the demo 🚀  🎆 ↘️  💩

Open a console, and launch the devnet `starknet-devnet --seed 0`

Open a second console, and launch the script :  
`npx ts-node src/starknet_jsNewAccount.ts`  

When you see that you have to fund your new wallet, it's automatic in devnet. 
Faucet for devnet, if necessary :  
```bash
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x1234","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
```
or `source ./mintWallet.sh`

More easy : use `npx ts-node src/starknet_jsExistingAccount.ts`, using preexisting account #0 created automatically during Devnet launch.

## 📟 Calculate Class Hash :
In the current version of Starknet.js (4.14.0), you have no function able to calculate the class hash of a new contract.  
You can use this CLI tool : [starkli](https://github.com/xJonathanLEI/starkli).  
Or use Hardhat for Starknet (install [here](https://github.com/Shard-Labs/starknet-hardhat-plugin)), with this [script](https://github.com/PhilippeR26/AskYourParents-contracts/tree/main/scripts/calculateClassHash.ts).


## 📜 scripts :
In the folder 'scripts', you can find many pedagogical codes :

### Accounts :
- Create accounts
    - Create OZ account
    - Create ArgentX account
    - Create your abstracted account
- Connect account
    - Connect predeployed account (only on devnet) [1.openPredeployedAccount](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/1.openPredeployedAccount.ts)
    - Connect created account
### Contracts :
- Declare contract
- Deploy contract
    - Deploy with OZ deployer (UDC)
    - Deploy with a custom deployer
- Declare & deploy contract with OZ deployer (UDC)
### Interactions
- Call
    - contract.nameFunction
    - contract.call
- Invoke  
    - without need of signature
        - contract.nameFunction
        - contract.invoke
    - with a signature : account.execute 


## 🤔 Questions?

Have a look in the starknet.js [documentation](https://www.starknetjs.com/docs/API/). Good luck 🤕.

Ask in #starknet-js channel in the [StarkNet Discord](https://discord.gg/C2JsG2j7Fs)

Philippe. ROSTAN @ critical.devs.fr - Phil26#1686 on Discord

## 🙏 Inspiration :
This script is a fork of https://github.com/0xs34n/starknet.js-workshop
