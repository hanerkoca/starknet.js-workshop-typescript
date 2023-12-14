// Connect to a Pathfinder Mainnet node
// Launch with npx ts-node src/scripts/mainnet/6.connectAlchemy.ts
// Coded with Starknet.js v5.10.2

import { RpcProvider, Contract, Account, json, uint256, shortString } from "starknet";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import { alchemyKey } from "../../../A-MainPriv/mainPriv";
import { ethAddress } from "../../utils/constants";
import fs from "fs";
import axios from 'axios';
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    //initialize the Provider, with a rpc node 

    //const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.g.alchemy.com/v2/' + alchemyKey });
    // with a Provider object : 
    const provider = new RpcProvider( { nodeUrl: 'http://192.168.1.44:6060/v0_5' } );
    // on the same computer : const provider = new Provider({ rpc: { nodeUrl: 'http://127.0.0.1:9545' } });
    const chainId = await provider.getChainId();
    console.log('Connected to the local network node (Mainnet)=', shortString.decodeShortString(chainId));

    // connect existing ArgentX account 4 in Mainnet
    const account4 = new Account(provider, account4MainnetAddress, account4MainnetPrivateKey);
    console.log('existing ArgentX account4 connected. Address =', account4.address, "\n");

    // Connect the ERC20 ETH instance in Mainnet
    const compiledEthContract = json.parse(fs.readFileSync("./compiledContracts/cairo060/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const ethContract = new Contract(compiledEthContract.abi, ethAddress, provider);
    ethContract.connect(account4);
    console.log('ETH ERC20 contract connected at =', ethContract.address);

    // direct acces with axios
    const apiKey = alchemyKey;
    const url =provider.nodeUrl ;
    console.log("url=",url);
    const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'starknet_blockNumber',
        params: []
    };

    const response = await axios.post(url, payload);

    console.log('Block Number:', response.data.result);



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
