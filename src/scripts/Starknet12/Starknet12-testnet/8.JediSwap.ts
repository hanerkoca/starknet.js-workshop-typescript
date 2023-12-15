// Invoke JediSwap
// launch with npx ts-node src/scripts/Starknet12/Starknet12-testnet/8.JediSwap.ts
// Coded with Starknet.js v6.0.0 beta7

import { Account, ec, json, hash, CallData, RpcProvider, Contract, cairo, stark, RawArgsObject, BigNumberish, Uint256, Call, num, encode, uint256 } from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";
import { DAIaddress, ethAddress } from "../../utils/constants";
import { blastKey } from "../../../A-MainPriv/mainPriv";
import fs from "fs";
import { formatBalance } from "../../utils/formatBalance";


async function main() {
    // local network Pathfinder on Testnet with rpc 0.5.0
    // const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" });
    const provider = new RpcProvider({ nodeUrl: 'https://starknet-testnet.blastapi.io/' + blastKey + "/rpc/v0.5" });
    await provider.getChainId(); // to be sure to be connected
    console.log("Provider connected.");

    // testnet
    const privateKey0 = account2TestnetPrivateKey;
    const account0Address = account2TestnetAddress;
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('AX account connected.\n');

    const contractAddress = "0x02bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965";

    const compiledERC20 = json.parse(fs.readFileSync("./compiledContracts/erc20ETH.json").toString("ascii"));
    const ethContract = new Contract(compiledERC20.abi, ethAddress, account0);
    const bal = await ethContract.balanceOf(account0.address);
    const decimals = await ethContract.decimals();
    // as it's a Cairo v0 contract :
    const bal2 = uint256.uint256ToBN(bal.balance);
    console.log("Account balance=", formatBalance(bal2, decimals),"ETH\nApproval of ETH");
    const res = await ethContract.approve(contractAddress, cairo.uint256(1.2 * 10 ** 15))
    const approveReceipt=await provider.waitForTransaction(res.transaction_hash);
    console.log("approve receipt=",approveReceipt.events);

    const proxyContractSierra = await provider.getClassAt(contractAddress);
    const proxyContract = new Contract(proxyContractSierra.abi, contractAddress, provider);
    type Res = {
        implementation: bigint
    }
    const classH = await proxyContract.call("get_implementation_hash") as Res;
    const swapCompiled = await provider.getClassByHash(classH.implementation);
    console.log("abi=", swapCompiled.abi[13]);
    const swapContract = new Contract(swapCompiled.abi, contractAddress, account0);

    const adminAddr = account0.address;
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
    console.log("deadline =", num.toHex(deadline));

    const myCall = swapContract.populate("swap_exact_tokens_for_tokens",
        {
            amountIn: cairo.uint256(1 * 10 ** 15),
            amountOutMin: cairo.uint256(100),
            path: [ethAddress, DAIaddress],
            to: adminAddr,
            deadline
        })
    console.log("Call=", myCall);



    // console.log("Calldata =",myCall.calldata);

    const resp = await account0.execute(myCall);
    const txReceipt = await provider.waitForTransaction(resp.transaction_hash);
    console.log("Receipt =", txReceipt);

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });