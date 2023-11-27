// Connect to a Mainnet node, located in a remote computer in the local network.
// Launch with npx ts-node src/scripts/mainnet/balanceMainnetNode.ts
// Coded with Starknet.js v5.21.0

import { Provider, RpcProvider, Contract, Account, json, uint256, shortString, ContractClassResponse, num } from "starknet";
import { account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import fs from "fs";
import { formatBalance } from "../../formatBalance";
// import * as dotenv from "dotenv";
// dotenv.config();

async function main() {
    //initialize the Provider, with a Juno rpc Mainnet node, located in the local network
    const provider = new RpcProvider({ nodeUrl: 'http://192.168.1.99:6060' });

    const chainId = await provider.getChainId();
    console.log('Connected to the local network node (Mainnet)=', shortString.decodeShortString(chainId));

    // connect existing ArgentX account 4 in Mainnet
    const account4 = new Account(provider, account4MainnetAddress, account4MainnetPrivateKey);
    console.log('existing ArgentX account4 connected. Address =', account4.address, "\n");

    // Connect the ERC20 ETH instance in Mainnet
    const ETHproxyAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const contractFilePathERC20 = "./compiledContracts/cairo060/ERC20ETH.json";
    let compiledEthContract: ContractClassResponse;
    if (!fs.existsSync(contractFilePathERC20)) {
        const compiledProxy = await provider.getClassAt(ETHproxyAddress); // abi of proxy
        const proxyContract = new Contract(compiledProxy.abi, ETHproxyAddress, provider);
        const { address: implementationAddress } = await proxyContract.implementation();
        // specific to this proxy : Implementation() returns an address of implementation.
        // Other proxies returns generaly a class hash of implementation
        const classHashERC20Class = await provider.getClassHashAt(num.toHex(implementationAddress)); // read the class hash related to this contract address.
        compiledEthContract = await provider.getClassByHash(classHashERC20Class); // final objective : the answer contains the abi of the ERC20.
        fs.writeFileSync(contractFilePathERC20, json.stringify(compiledEthContract, undefined, 2));
    }
    else {
        compiledEthContract = json.parse(fs.readFileSync(contractFilePathERC20).toString("ascii"));
    }
    const ethContract = new Contract(compiledEthContract.abi, ETHproxyAddress, provider);
    // ethContract.connect(account4);
    console.log('ETH ERC20 contract connected at =', ethContract.address);

    // Interactions with the contract with call
    const res1 = await ethContract.balanceOf(account4.address); // Cairo 0 contract response is not a bigint (Cairo 1 does)
    // const bal1b = await ethContract.call("balanceOf",[ethAddress]);
    const balance = BigInt(uint256.uint256ToBN(res1.balance));
    // const balanceb: number = Number(uint256.uint256ToBN(bal1b.balance));
    console.log("Node report that account 4 owns", formatBalance(balance, 18), "ETH");

    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
