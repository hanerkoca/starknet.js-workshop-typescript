// Test creation of Braavos account.
// use Starknet.js v5.19.5 (+ commit), starknet-devnet 0.6.2
// launch with npx ts-node src/scripts/braavos/4.signerAbstractionBraavos.ts

import { Provider, Account, Calldata, Signer, BigNumberish, ec, hash, json, CallData, Contract } from "starknet";
import { abstractionFns } from "./14b.myAccountAbstractionMod";
import fs from "fs";
import axios from "axios";


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // declare abstracted account
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/.casm.json").toString("ascii"));

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const classHashContract = declareResponse.class_hash;
    console.log("Account Class Hash =", classHashContract);
    // ********* deploy Abstraction 
    const privateKeyAbstraction = "0x7aadb6605c9538199797920884694b5ce84fc68f92c832b0";
    const signerAbstraction = new Signer(privateKeyAbstraction, abstractionFns);
    const starkKeyPubAbstraction = ec.starkCurve.getStarkKey(privateKeyAbstraction);
    const addressAbstraction = hash.calculateContractAddressFromHash(
        starkKeyPubAbstraction,
        classHashContract,
        [starkKeyPubAbstraction],
        0
    );
    const accountAbstraction = new Account(provider, addressAbstraction, signerAbstraction);

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
        undefined,
        1, 2, 3
    );
    const MyAccountContract=new Contract(compiledSierra.abi,accountAbstraction.address,provider);
    console.log("Abstracted account deployed at :", contract_address);
    await provider.waitForTransaction(transaction_hash);
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
