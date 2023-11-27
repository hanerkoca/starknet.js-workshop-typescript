// test in testnet/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo12-devnet/8a.SimulateTransaction.ts
// Coded with Starknet.js v5.23.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, Invocations, TransactionType, Call, SimulateTransactionResponse, } from "starknet";
import fs from "fs";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";
import { infuraKey, account4MainnetAddress, account4MainnetPrivateKey } from "../../../A-MainPriv/mainPriv";
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../../resetDevnetFunc";
dotenv.config();

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function main() {
    resetDevnetNow();
    console.log("Devnet restarted.");
    // initialize Provider 
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only for starknet-devnet-rs
    // const provider = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" }); // testnet
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey }); // testnet
    // const provider = new RpcProvider({ nodeUrl: "http://192.168.1.44:9545/rpc/v0.5" }); // local pathfinder testnet
    const ch = await provider.getChainId();
    console.log("Chain Id =", ch);

    // devnet (starknet-devnet-rs do not accept simulateTx)
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    // existing Argent X testnet account
    // const privateKey = account2TestnetPrivateKey;
    // const accountAddress = account2TestnetAddress.toLowerCase();
    // existing Argent X mainnet account
    // const privateKey = account4MainnetPrivateKey;
    // const accountAddress = account4MainnetAddress
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('existing_ACCOUNT_ADDRESS=', accountAddress);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/reject.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/reject.casm.json").toString("ascii"));


    // testnet
    // const contractAddress = "0x76e73ba220fcdc9b0b0b68556b9a59f36f5d124349db56e1de4879aa61a91ef"; 
    // mainnet
    // const contractAddress = "0x02bD907B978F58ceDf616cFf5CdA213d63Daa3AD28Dd3C1Ea17cA6CF5E1D395F"; 
    // devnet
    const resDec = await account0.declareIfNot({ contract: compiledSierra, casm: compiledCasm });
    console.log("contract declared.");
    await provider.waitForTransaction(resDec.transaction_hash);
    const { contract_address: contractAddress, transaction_hash } = await account0.deployContract({ classHash: resDec.class_hash });
    console.log("contract deployed.");
    await provider.waitForTransaction(transaction_hash);

    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);



    // 👇👇 this code works on any provider
    const myCall = myTestContract.populate("test_fail", [100]);
    // const resEst = await account0.estimateInvokeFee([myCall, myCall]);
    // console.log("estimateFee =", resEst);

    // simulate declare
    const invocation1: Invocations = [
        {
            type: TransactionType.DECLARE,
            contract: compiledSierra,
            casm: compiledCasm,
        },
    ];
    let resSim: SimulateTransactionResponse | undefined;
    try {
        resSim = await account0.simulateTransaction(invocation1);
        console.log("simulateDeclare =", resSim);
    } catch (err) {
        console.log("simulateDeclare =",err,"\n");
    }

    // estimate declare
    try {
        const estDec = await account0.estimateDeclareFee({
            contract: compiledSierra,
            casm: compiledCasm
        });
        console.log("estimateDecl =", estDec);
    } catch (err) {
        console.log("estimateDecl =",err,"\n");
    }




    // 👇👇 This code fails because SkipValidate is only on sequencers.
    try {const res2est = await provider.getInvokeEstimateFee({ signature: ["0x59a706cffa8bf081be3e117b14dda57cb31c3dcaee116b48d23c5f5d9623847", "0x755bc64c3365743c7a12c7f3fb7d95e6c6ced6f3846f48e240efa67b5403da"], ...myCall }, { nonce: 0 });
    console.log("estimateFeeInvoke =", res2est);
} catch (err) {
    console.log("estimateFeeInvoke =",err,"\n");
}

    // 👇👇 works only with a local pathfinder :
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
    ];
    try {
        const res1 = await account0.simulateTransaction(invocation0);
        console.log("simulateTransaction =", res1[0].transaction_trace);
    } catch (err) {
        console.error("simulateTransaction =", err,"\n");
    }


    // 👇👇 This code fails with response : LibraryError: -32603: Transaction reverted: 
    try {
        const res1 = await provider.getSimulateTransaction([{
            type: TransactionType.INVOKE,
            contractAddress: contractAddress,
            entrypoint: "test_fail",
            calldata: [100],
            nonce: 0,
            signature: ["0x59a706cffa8bf081be3e117b14dda57cb31c3dcaee116b48d23c5f5d9623847", "0x755bc64c3365743c7a12c7f3fb7d95e6c6ced6f3846f48e240efa67b5403da"] // how can it works? no account address related to this sign!
        }], { skipValidate: true });
        console.log("getSimulateTransaction =", res1);
    } catch (err) {
        console.error("getSimulateTransaction =", err,"\n");
    }

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });