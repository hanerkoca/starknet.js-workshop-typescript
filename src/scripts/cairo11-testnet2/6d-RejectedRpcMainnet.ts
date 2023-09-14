// test in testnet2/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6a.Rejected.ts
// Coded with Starknet.js v5.19.5

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, SequencerProvider } from "starknet";
import fs from "fs";
import { account1Testnet2ArgentXAddress, account1Testnet2ArgentXprivateKey, TonyNode } from "../../A2priv/A2priv";
import { account2TestnetAddress, account2TestnetPrivateKey, junoNMtestnet } from "../../A1priv/A1priv";
import { account4MainnetAddress, account4MainnetPrivateKey, infuraKey, alchemyKey, blastKey, lavaMainnetKey, junoNMmainnet } from "../../A-MainPriv/mainPriv";
import { junoNMtestnet2 } from "../../A2priv/A2priv";

function wait(delay: number) {
    return new Promise((res) => {
        setTimeout(res, delay);
    });
}

async function main() {
    //initialize Provider 

    // *** Mainnet ***
    // Infura node rpc for Mainnet :
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.infura.io/v3/' + infuraKey });
    // Blast node rpc for mainnet :
    //const provider = new RpcProvider({ nodeUrl: 'https://starknet-mainnet.blastapi.io/' + blastKey + "/rpc/v0.4" });
    //const provider = new RpcProvider({ nodeUrl: "https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/"+lavaMainnetKey});
    // Nethermind Juno node rpc for Mainnet (only whitelisted access) :
    //const provider = new RpcProvider({ nodeUrl: junoNMmainnet });
    // mainnet sequencer (soon deprecated) :
    //const provider = new SequencerProvider({ network: constants.NetworkName.SN_MAIN });
    // my personal local Pathfinder node
    const provider = new RpcProvider({ nodeUrl: 'http://192.168.1.99:9545/rpc/v0.4' });


    // initialize existing Argent X account
    
    const account0Address = account4MainnetAddress;
    const account0PrivKey = account4MainnetPrivateKey;

    console.log('existing_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, account0PrivKey, "1");
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));

    const contractAddress = "0x02bd907b978f58cedf616cff5cda213d63daa3ad28dd3c1ea17ca6cf5e1d395f" // Mainnet 


    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    const blockNum = await provider.getBlock("latest");
    wait(800);
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1, "\nBlock# =", blockNum.block_number);

    // use 100 to have a success.
    // use any other u8 to have a reverted tx.
    let end: number = 0;
    const { transaction_hash: txH2 } = await myTestContract.invoke("test_fail", [100], { maxFee: 1_000_000_000_000_001 }); // maxFee is necessary to avoid error during estimateFeee
    const start = new Date().getTime();
    console.log("txH2 =", txH2);
    for (let i = 0; i < 20; i++) {
        let txR: any;
        try { txR = await provider.getTransactionReceipt(txH2) }
        catch { txR = i.toString() + ". TxH not yet in memPool." };
        if (!!txR.execution_status) {
            if (!end) { end = new Date().getTime() }
            console.log("txR: execution =", txR.execution_status, ",", txR.finality_status)
        } else {
            console.log("txR:", txR)
        }
        await wait(1000);
    }
    const txR2 = await provider.waitForTransaction(txH2);
    if (!end) { end = new Date().getTime() };
    console.log("txR2 =", txR2);

    const count2 = await myTestContract.get_counter();
    console.log("counter =", count2);
    console.log("Duration (s) =", (end - start) / 1000);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });