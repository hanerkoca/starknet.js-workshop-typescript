// test in testnet/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12-devnet/8a.SimulateTransaction.ts
// Coded with Starknet.js v5.21.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, Invocations, TransactionType, Call } from "starknet";
import fs from "fs";
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../A-MainPriv/mainPriv";

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function main() {
    // initialize Provider 
    // const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    // const provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" }); // testnet
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey }); // testnet
    const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" }); // local pathfinder testnet
    const ch = await provider.getChainId();
    console.log("Chain Id =", ch);

    // devnet (starknet-devnet-rs do not accept simulateTx)
    //const privateKey = "0x71d7bb07b9a64f6f78ac4c816aff4da9";
    //const accountAddress: string = "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691";
    // existing Argent X testnet account
    const privateKey = account5TestnetPrivateKey;
    const accountAddress = account5TestnetAddress.toLowerCase();
    // existing Argent X mainnet account
    // const privateKey = account4MainnetPrivateKey;
    // const accountAddress = account4MainnetAddress
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/reject.sierra.json").toString("ascii"));


    const contractAddress = "0x76e73ba220fcdc9b0b0b68556b9a59f36f5d124349db56e1de4879aa61a91ef"; // testnet
    // const contractAddress = "0x02bD907B978F58ceDf616cFf5CdA213d63Daa3AD28Dd3C1Ea17cA6CF5E1D395F"; // mainnet


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
    const myCall = myTestContract.populate("test_fail", [100]);

    // 👇👇 this code works on any provider
    const resEst = await account0.estimateInvokeFee([myCall, myCall]);
    console.log("estimateFee =", resEst);

    // 👇👇 This code fails because SkipValidate is only on sequencers.
    const res2est = await provider.getInvokeEstimateFee({ signature: ["0x59a706cffa8bf081be3e117b14dda57cb31c3dcaee116b48d23c5f5d9623847", "0x755bc64c3365743c7a12c7f3fb7d95e6c6ced6f3846f48e240efa67b5403da"], ...myCall }, { nonce: 0 }, undefined, true)
    console.log("estimateFee2 =", res2est);

    let res1: any;
    // 👇👇 works only with a local pathfinder :
    try { res1 = await account0.simulateTransaction(invocation0) } catch (err) {
        console.error("aaa", err);
    }
    // console.log(res1, "\nResult =", res1[0].result);
    console.log("res1 trace =", res1[0].transaction_trace);
    // console.log("Fee =", res1[0].fee_estimation);

    // 👇👇 This code fails with response : LibraryError: -32603: Transaction reverted: 
    try {
        res1 = await provider.getSimulateTransaction([{
            type: TransactionType.INVOKE,
            contractAddress: contractAddress,
            entrypoint: "test_fail",
            calldata: [100],
            nonce: 0,
            signature: ["0x59a706cffa8bf081be3e117b14dda57cb31c3dcaee116b48d23c5f5d9623847", "0x755bc64c3365743c7a12c7f3fb7d95e6c6ced6f3846f48e240efa67b5403da"] // how can it works? no account address related to this sign!
        }], { skipValidate: true })
    } catch (err) {
        console.error("bbb", err);
    }

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });