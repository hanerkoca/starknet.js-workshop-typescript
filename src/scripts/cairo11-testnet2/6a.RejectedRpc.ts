// test in testnet2/rpc0.4.0 a contract that can be rejected.
// launch with npx ts-node src/scripts/cairo11-testnet2/6a.Rejected.ts
// Coded with Starknet.js v5.19.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider } from "starknet";
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
    //  *** Testnet 2 ***
    // const provider = new RpcProvider({ nodeUrl: TonyNode });;
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli2.infura.io/v3/' + infuraKey });
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-testnet-2.blastapi.io/' + blastKey });
    const provider = new RpcProvider({ nodeUrl: junoNMtestnet2 });


    //  *** Testnet 1 ***
    // const provider = new RpcProvider({ nodeUrl: 'https://starknet-goerli.infura.io/v3/' + infuraKey });
    // const provider = new RpcProvider({ nodeUrl: "https://starknet-goerli.g.alchemy.com/v2/" + alchemyKey });
    // const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.blastapi.io/"" + blastKey +"/rpc/v0.4"});
    // const provider = new RpcProvider({ nodeUrl: junoNMtestnet });

    // *** Mainnet ***
    //const provider = new RpcProvider({ nodeUrl: "https://g.w.lavanet.xyz:443/gateway/strk/rpc-http/+lavaMainnetKey"});
    // const provider = new RpcProvider({ nodeUrl: junoNMmainnet });


    // initialize existing Argent X account
    const account0Address = account1Testnet2ArgentXAddress;
    const account0PrivKey = account1Testnet2ArgentXprivateKey;
    //const account0Address = account2TestnetAddress;
    //const account0PrivKey = account2TestnetPrivateKey;
    // const account0Address = account4MainnetAddress;
    // const account0PrivKey = account4MainnetPrivateKey;

    console.log('existing_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, account0PrivKey);
    console.log('existing account connected.\n');

    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/reject.sierra.json").toString("ascii"));

    const contractAddress = "0x2b8a9002121875e6ce75f3ea30b8df471c93e8466983226473b3b63a355628a"; // Testnet 2
    // const contractAddress = "0x1073c451258ff87d4e280fb00bc556767cdd464d14823f84fcbb8ba44895a34"; // Testnet 1
    // const contractAddress="0x02bd907b978f58cedf616cff5cda213d63daa3ad28dd3c1ea17ca6cf5e1d395f" // Mainnet 


    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected =', myTestContract.address);

    // console.log(myTestContract.functions);
    const blockNum = await provider.getBlock("latest");
    await wait(800);
    const count1 = await myTestContract.get_counter();
    console.log("counter =", count1, "\nBlock# =", blockNum.block_number);
    // use 100 to have a success.
    // use any other u8 to have a reverted tx.
    const { transaction_hash: txH2 } = await myTestContract.invoke("test_fail", [100], { maxFee: 1_000_000_000_000_001 }); // maxFee is necessary to avoid error during estimateFeee
    console.log("txH2 =", txH2);
    for (let i = 0; i < 20; i++) {
        let txR: any;
        try { txR = await provider.getTransactionReceipt(txH2) }
        catch { txR = i.toString() + ". TxH not yet in memPool." };
        txR.execution_status ?
            console.log("txR: execution =", txR.execution_status, ",", txR.finality_status)
            : console.log("txR:", txR)
        await wait(1000);
    }
    const txR2 = await provider.getTransactionReceipt(txH2);
    //const txR2 = await provider.waitForTransaction(txH2);
    console.log("txR2 =", txR2);

    const count2 = await myTestContract.get_counter();
    console.log("counter =", count2);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });