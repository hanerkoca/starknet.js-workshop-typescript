# Starkware Starknet network
# Cairo Account and ERC20 Demo 
# Typescript code, using starknet.js and local Starknet-devnet 


If you want to implement the Starknet network in your DAPP, you can use starknet.js to interact with it.
 
This little script shows how to use and test very quickly your starknet.js code without any user interface.

Even if this code is very small, it's a good guideline to always write it in Typescript.

Starknet mainnet and testnet are (very) slow. To speed up the execution, we use Starknet-devnet, that create a local Starknet network.

## 🛠️ Installation  :pick:

Use `cd starknet.js-workshop-typescript` to go to the root of the project.

If necessary :

- Install latest LTS version of node [here](https://kinsta.com/blog/how-to-install-node-js/#how-to-install-nodejs-on-linux)
- Install Python 3.9  [here](https://linuxize.com/post/how-to-install-python-3-9-on-ubuntu-20-04/)
- Create a Starknet environment [here](https://starknet.io/docs/quickstart.html)
- Install Starknet-devnet  [here](https://shard-labs.github.io/starknet-devnet/docs/intro)
  
Run `npm install` in this directory.

The file .env defines the network to use. It's currently configured for the local devnet. As explained in the file, you can change easily to Testnet or Mainnet.

This repo is configured to be able to perform debugging of your typescript code. Just CTRL+SHIFT+D, then click on the green arrow.

This script has been written with cairo v0.10.0, starknet-devnet v0.3.3, starknet.js v4.8.0. Due to fast iterations of Starknet and Cairo, this script will probably be quickly out-of-date.



The Account contract used in this workshop is made by [OpenZeppelin](https://github.com/OpenZeppelin/cairo-contracts), contract version 0.4.0.

##  🚀 Start the demo 🚀  🎆 ↘️  💩

Open a console, and launch the devnet `starknet-devnet --seed 0`

Open a second console, and launch the script :  
`npx ts-node src/starknet_jsNewAccount.ts`  

When you see that you have to fund your new wallet, it's easy in devnet : use this command in a third console, where you have to replace 0x1234 with the account address provided in the second console :  
```
curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x1234","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
```
or `source ./mintWallet.sh`
Then press enter in the second console ; the script will proceed until end.


More easy : use `npx ts-node src/starknet_jsExistingAccount.ts`, using preexisting account #0 created automatically during Devnet launch.

You can easily use these scripts as a basis for your needs.

## 🤔 Questions?

Have a look in the starknet.js [documentation](https://www.starknetjs.com/docs/API/). Good luck 🤕.

Ask in #starknet-js channel in the [StarkNet Discord](https://discord.gg/C2JsG2j7Fs)

Philippe ROSTAN @ critical.devs.fr - Phil26#1686 on Discord

## 🙏 Inspiration
This script is a fork of https://github.com/0xs34n/starknet.js-workshop
