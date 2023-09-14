// test in testnet2/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6a.Rejected.ts
// Coded with Starknet.js v5.19.0

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

    // // ******* TESTNET ************
    // // Alchemy node rpc for Testnet (do not work today) :
    // const providerAlchemyTestnet = new RpcProvider({ nodeUrl: 'https://starknet-goerli.g.alchemy.com/v2/' + alchemyKey });
    // // Infura node rpc for Testnet :
    //const providerTestnetInfura = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
    // // Blast node rpc for Testnet :
    // const providerBlastTestnet = new RpcProvider({ nodeUrl: 'https://starknet-testnet.blastapi.io/' + blastKey + "/rpc/v0.4" });
    // // Nethermind Juno node rpc for Testnet (only whitelisted access) :
    // const providerNethermindTestnet = new RpcProvider({ nodeUrl: junoNMtestnet });
    // // Lava node rpc for Testnet : 
    const providerLavaTestnetPublic = new RpcProvider({ nodeUrl: "https://json-rpc.starknet-testnet.public.lavanet.xyz" });
    // // Testnet 1 sequencer (soon deprecated):
    // const providerTestnet = new SequencerProvider({ network: constants.NetworkName.SN_GOERLI });

    const provider = providerLavaTestnetPublic;
    // initialize existing Argent X account
    
    const account0Address = account2TestnetAddress;
    const account0PrivKey = account2TestnetPrivateKey;
    

    console.log('existing_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, account0PrivKey, "1");
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));

    const contractAddress = "0x1073c451258ff87d4e280fb00bc556767cdd464d14823f84fcbb8ba44895a34"; // Testnet 1

    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    const blockNum = await provider.getBlock();
    const blockNum2 = await provider.getBlock("latest");
    const blockNum3 = await provider.getBlock("pending");
    wait(800);
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1, "\nBlock time =", blockNum.timestamp, blockNum2.timestamp, blockNum3.timestamp);
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