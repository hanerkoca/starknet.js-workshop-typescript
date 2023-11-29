// Create a new OpenZeppelin account in Starknet Sepolia testnet. Step 2/3
// launch with npx ts-node src/scripts/Starknet12/Starknet12-sepolia/2.checkFunding.ts
// Coded with Starknet.js v5.24.3

import { Account, ec, json, hash, CallData, RpcProvider, Contract, cairo, stark, uint256 } from "starknet";
import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
import { account0OZSepoliaAddress, account7TestnetAddress, account7TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import { junoNMtestnet } from "../../../A1priv/A1priv";
import { ethAddress } from "../../utils/constants";
import { formatBalance } from "../../formatBalance";


// In Sepolia, use the bridge https://sepolia.etherscan.io/address/0x8453fc6cd1bcfe8d4dfc069c400b433054d47bdc#writeProxyContract
// Use the function 4 : deposit (0xe2bbb158)
// with params (for ETH) :
// deposit= 0.1
// amount (uint256)= 99000000000000000  // put a value < 0.1 ETH
// l2Recipient (uint256)= 0xxxxxxxxxxxxxxx4


async function main() {
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" }); // local pathfinder sepolia testnet node
    console.log("Provider connected.");
    const contractFilePathERC20 = "./compiledContracts/cairo060/ERC20ETH.json";
    const compiledEthContract = json.parse(fs.readFileSync(contractFilePathERC20).toString("ascii"));

    const ethContract = new Contract(compiledEthContract.abi, ethAddress, provider);
    console.log('ETH ERC20 contract connected at =', ethContract.address);

    const res1 = await ethContract.balanceOf(account7TestnetAddress);
    const balance = BigInt(uint256.uint256ToBN(res1.balance));
    console.log("addr: ", account0OZSepoliaAddress, res1, balance);
    console.log("Node report that account owns", formatBalance(balance, 18), "ETH");


    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
