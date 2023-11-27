// connect a contract that is already deployed on devnet.
// use Starknet.js v5.5.0, starknet-devnet 0.5.0.a1
// launch with npx ts-node src/scripts/cairo11-devnet/11.CallInvokeContract.ts

import { CallData, Provider, Contract, Account, json, uint256, constants } from "starknet";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey } from "../../A2priv/A2priv";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for deployement of Test (script4).
//          👆👆👆
async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI2 } });
    console.log('✅ Connected to testnet2.');

    // initialize existing predeployed account 0 of Devnet
    const accountAddress: string = accountTestnet2ArgentX1Address;
    const privateKey = accountTestnet2ArgentX1privateKey;
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account deployed\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);


    // Connect the deployed Test instance in devnet
    const testAddress = "0x771bbe2ba64fa5ab52f0c142b4296fc67460a3a2372b4cdce752c620e3e8194";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test_type3.sierra").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);

    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    const par1 = CallData.compile({
        p1: uint256.bnToUint256(10n),
    })
    // const myUint256=uint256.bnToUint256(10n);
    // const res1 = await myTestContract.test_u256(myUint256);
    // console.log("res1 =", res1);

    const res2 = await myTestContract.test_felt252(100);
    console.log("res2 =", res2);

    // const res3 = await myTestContract.test3({ parseRequest: false, parseResponse: false, });
    const tx = await myTestContract.increase_balance(
        CallData.compile({
            amount: 100,
        })
    );
    // console.log("res3 =", res3[0]);
    await provider.waitForTransaction(tx.transaction_hash);

    const balance = await myTestContract.get_balance({
        parseRequest: false,
        parseResponse: false,
    });
    console.log("balance =", balance[0]);
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });