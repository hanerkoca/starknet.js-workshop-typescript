// Connect to a Pathfinder Mainnet node, located in a remote computer in the local network.
// Launch with npx ts-node src/scripts/mainnet/balanceMainnetNode.ts
// Coded with Starknet.js v5.5.0

import { Provider, RpcProvider, Contract, Account, json, uint256 } from "starknet";
import { accountMainnet4Address, accountMainnet4AddressprivateKey } from "../../A-MainPriv/mainPriv";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for deployement of Test (script5).
//          👆👆👆
async function main() {
    //initialize the Provider, with a rpc node located in the local network
    const provider = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545' });
    // with a Provider object : const provider = new Provider({ rpc: { nodeUrl: 'http://192.168.1.99:9545' } });
    // on the same computer : const provider = new Provider({ rpc: { nodeUrl: 'http://127.0.0.1:9545' } });
    const chainId = await provider.getChainId();
    console.log('Connected to the local network node (Mainnet)=', chainId);

    // connect existing ArgentX account 4 in Mainnet
    const account4 = new Account(provider, accountMainnet4Address, accountMainnet4AddressprivateKey);
    console.log('existing ArgentX account4 connected. Address =', account4.address, "\n");

    // Connect the ERC20 ETH instance in Mainnet
    const ethAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const compiledEthContract = json.parse(fs.readFileSync("./compiledContracts/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const ethContract = new Contract(compiledEthContract.abi, ethAddress, provider);
    ethContract.connect(account4);
    console.log('ETH ERC20 contract connected at =', ethContract.address);

    // Interactions with the contract with call
    const res1 = await ethContract.balanceOf(account4.address);
    // const bal1b = await ethContract.call("balanceOf",[ethAddress]);
    const balance: number = Number(uint256.uint256ToBN(res1.balance));
    // const balanceb: number = Number(uint256.uint256ToBN(bal1b.balance));
    console.log("Node report that account 4 owns", balance / 1E18, "ETH");

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });