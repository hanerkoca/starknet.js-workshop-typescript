// Deployement of Cairo1 abstracted account.
// use Starknet.js v5.19.5 (+ commit), starknet-devnet 0.6.2
// launch with npx ts-node src/scripts/cairo12-devnet/14.deployAccountAbstraction.ts

import { Provider, Account, Calldata, Signer, BigNumberish, ec, hash, json, CallData, Contract } from "starknet";
import { abstractionFns } from "./14b.myAccountAbstractionMod";
import fs from "fs";
import axios from "axios";
import { resetDevnetNow } from "../../utils/resetDevnetFunc";


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');

    resetDevnetNow()
    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // declare abstracted account
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/account_abstraction.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo210/account_abstraction.casm.json").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const classHashContract = declareResponse.class_hash;
    console.log("Account Class Hash =", classHashContract, declareResponse.transaction_hash);
    // console.log("TxR =",await provider.getTransactionReceipt(declareResponse.transaction_hash));
    const contract = await provider.getClassByHash(classHashContract);
    // console.log("Class =",contract.entry_points_by_type);
    // ********* deploy Abstraction 
    const privateKeyAbstraction = "0x7aadb6605c9538199797920884694b5ce84fc68f92c832b0";
    const signerAbstraction = new AbstractedSigner(privateKeyAbstraction, abstractionFns);
    const starkKeyPubAbstraction = ec.starkCurve.getStarkKey(privateKeyAbstraction);
    console.log("account pubKey =", starkKeyPubAbstraction);
    const addressAbstraction = hash.calculateContractAddressFromHash(
        starkKeyPubAbstraction,
        classHashContract,
        [starkKeyPubAbstraction],
        0
    );
    const accountAbstraction = new Account(provider, addressAbstraction, signerAbstraction, "1");

    // fund account address before account creation       
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": accountAbstraction.address, "amount": 10_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer); // 10 ETH

    // deploy Abstracted account
    const constructor: Calldata = CallData.compile([starkKeyPubAbstraction]);

    const { transaction_hash, contract_address } = await accountAbstraction.deployAccount({
        classHash: classHashContract,
        constructorCalldata: constructor,
        contractAddress: addressAbstraction,
        addressSalt: starkKeyPubAbstraction
    },
        { maxFee: 100_000_000_000_000_000n },
        1, 2, 3
    );
    const MyAccountContract = new Contract(compiledSierra.abi, accountAbstraction.address, provider);
    console.log("Abstracted account deployed at :", contract_address);
    const tr1 = await provider.waitForTransaction(transaction_hash);
    console.log(tr1);
    console.log("✅ Abstracted deploy account tests completed");

    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
