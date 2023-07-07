# Starkware Starknet network ^0.12.0
# Cairo Accounts and ERC20 Demo 
# Typescript code, using Starknet.js v5.6.0 and local Starknet-devnet 
![Starknet.js](/src/img/starknet-js.png)

If you want to implement the Starknet network in your DAPP, you can use starknet.js to interact with it.
 
These little scripts shows how to use and test very quickly your starknet.js code without any user interface.

Even if these codes are very small, it's a good guideline to always write them in Typescript.

Starknet mainnet and testnet are (very) slow. To speed up the execution, we use Starknet-devnet, that creates a local Starknet network.

## 🛠️ Installation 🛠️

copy this repo to your local disk.
Use `cd starknet.js-workshop-typescript` to go to the root of the project.

If necessary :

- Install latest LTS version of node [here](https://kinsta.com/blog/how-to-install-node-js/#how-to-install-nodejs-on-linux)
- Install Python 3.9  [here](https://linuxize.com/post/how-to-install-python-3-9-on-ubuntu-20-04/)
- Create a Starknet environment [here](https://starknet.io/docs/quickstart.html), with cairo 0.12.0 minimum.
- Install Starknet-devnet  [here](https://shard-labs.github.io/starknet-devnet/docs/intro)
  
Run `npm install` in this directory.

The file .env defines the network to use. It's currently configured for the local devnet. As explained in the file, you can change easily to Testnet (1 or 2) or Mainnet.

This repo is configured to be able to perform debugging of your typescript code. Just CTRL+SHIFT+D, then click on the green arrow.

This script has been written with cairo v0.12.0, starknet-devnet v0.5.5, starknet.js v5.16.0. Due to fast iterations of Starknet and Cairo, this script will probably be quickly out-of-date.



The Account contract used in this workshop is made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts), contract version 0.6.1.

##  🚀 Start the demo 🚀  🎆 ↘️  💩

Open a console, and launch the devnet `starknet-devnet --seed 0`

Open a second console, and launch the script :  
`npx ts-node src/starknet_jsNewAccount.ts`  

When you see that you have to fund your new wallet, it's automatic in devnet.  
Faucet for devnet, if necessary :  
```bash
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x1234","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
```
or `source ./src/scripts/mintWallet.sh`

More easy : use `npx ts-node src/starknet_jsExistingAccount.ts`, using preexisting account #0 created automatically during Devnet launch.

## 📜 scripts :
In the folder 'scripts', you can find many pedagogical codes :

### Accounts :
- Create accounts
    - Create OZ account [script2](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/2.createNewOZaccount.ts)
    - Create ArgentX account [script3](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/3.createNewArgentXaccount.ts)
    - Create your abstracted account [script10](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/10.createAccountAbstraction.ts)
- Connect account
    - Connect predeployed account (only on devnet) [script1](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/1.openPredeployedAccount.ts)
    - Connect created account [script8](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/8.ConnectWallet.ts)
### Contracts :
- Declare contract [script9](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/9.declareContract.ts)
- Deploy contract [script4](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/4.deployContractOZ.ts)
- Declare & deploy  [script5](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/5.declareDeployContractOZ.ts)
### Interactions
- Connect a contract [script7](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/7.connectContract.ts)
- Call
    - contract.nameFunction [workshop](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/starknet_jsExistingAccount.ts#L50)
    - contract.call [script11](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/11.CallInvokeContract.ts)
- Invoke  
    - without need of signature
        - contract.nameFunction [workshop](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/starknet_jsExistingAccount.ts#L56)
        - contract.invoke [script11](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/scripts/11.CallInvokeContract.ts)
    - with a signature : account.execute [workshop](https://github.com/PhilippeR26/starknet.js-workshop-typescript/blob/main/src/starknet_jsExistingAccount.ts#L69)
### Others :

You can find in this repo many other scripts. Dig in and find many usefull exemples of code.

## Cairo 1 :

You can find some explanations for the use of Starknet.js with Cairo 1&2 smart-contracts [here](./Cairo1.md).

## 🤔 Questions?

Have a look in the starknet.js [documentation](https://www.starknetjs.com/docs/next/guides/intro).

Ask in #starknet-js channel in the [StarkNet Discord](https://discord.gg/C2JsG2j7Fs)

Philippe. ROSTAN @ critical.devs.fr - Phil26#1686 on Discord

## 🙏 Inspiration :
This script is a fork of https://github.com/0xs34n/starknet.js-workshop
