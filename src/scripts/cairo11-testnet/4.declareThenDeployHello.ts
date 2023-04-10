// declare & deploy a Cairo 1 contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA1/4b.declareDeployHello.ts

import { Provider, Account, Contract, ec, json, stark, uint256, shortString, constants } from "starknet";
import { privateKey0 } from "../../A1priv/A1priv";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });


    const account0Address: string = "0x065A822fBeE1Ae79e898688b5A4282Dc79E0042cbEd12F6169937FdDb4c26641";
    const account0 = new Account(provider, account0Address, privateKey0);
    console.log('existing AX account2 connected.\n');

    // Declare & deploy Test contract in devnet
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/test_type1.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/test_type1.casm").toString("ascii"));
    const deployResponse = await account0.declare({ contract: compiledHelloSierra, casm: compiledHelloCasm });
    const contractClassHash = deployResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    await provider.waitForTransaction(deployResponse.transaction_hash);

    const { transaction_hash: th2, contract_address } = await account0.deployContract({ classHash: contractClassHash });
    console.log("contract_address =", contract_address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledHelloSierra.abi, contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });