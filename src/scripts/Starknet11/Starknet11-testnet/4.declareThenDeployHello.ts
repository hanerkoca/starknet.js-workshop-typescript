// declare & deploy a Cairo 1 contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA1/4b.declareDeployHello.ts

import { Provider, Account, Contract, ec, json, stark, uint256, shortString, constants } from "starknet";
import { account5TestnetAddress, account5TestnetPrivateKey } from "../../A1priv/A1priv";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });


    const account0Address = account5TestnetAddress;
    const account0 = new Account(provider, account0Address, account5TestnetPrivateKey);
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