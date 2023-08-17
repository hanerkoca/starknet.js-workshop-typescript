// test in testnet2/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6a.Rejected.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, Invocations, TransactionType, Call } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";

import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function main() {
    // initialize Provider 
    // const provider = new RpcProvider({ nodeUrl: TonyNode });;
    // const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" });
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);

    // initialize existing Argent X account
    // const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    // const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const privateKey = account4MainnetPrivateKey;
    const accountAddress = account4MainnetAddress
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/reject.sierra.json").toString("ascii"));


    const contractAddress = "0x02bD907B978F58ceDf616cFf5CdA213d63Daa3AD28Dd3C1Ea17cA6CF5E1D395F";
    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    const invocation0: Invocations = [
        {
            type: TransactionType.INVOKE,
            contractAddress: contractAddress,
            entrypoint: "test_fail",
            calldata: [100]
        },
        {
            type: TransactionType.INVOKE,
            contractAddress: contractAddress,
            entrypoint: "test_fail",
            calldata: [100]
        }
    ]
    let res1: any;
    try { res1 = await account0.simulateTransaction(invocation0) } catch (err) {
        console.error("aaa", err);
        //console.log("BBB", err)
    }

    console.log(res1,"\n",res1[0]);
    //console.log("res1 =", res1[0], "\n", res1[0].transaction_trace, "\n", res1[0].fee_estimation);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });