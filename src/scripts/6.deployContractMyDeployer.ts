// Deploy an instance of an already declared contract.
// use of your custom deployer
// launch with npx ts-node src/scripts/6.deployContractMyDeployer.ts

import { Provider, Account, Contract, ec, json, number, stark } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' before using this script.
//          Launch also the script for declaration of Test contract : script 9.
//          👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing OZ account0 connected.');

    //declare & deploy myDeployer
    const myDeployerClassHash = "0x2cfbde0971a5000868447d421945922ee66968eba14d1ea675f992f6bd52621";
    const myDeployercompiled = json.parse(fs.readFileSync("./compiledContracts/myUniversalDeployer.json").toString("ascii"));
    const deployDeployerResponse = await account0.declareDeploy({ contract: myDeployercompiled, classHash: myDeployerClassHash, salt: "0" });
    console.log("deployer address =", deployDeployerResponse.deploy.address);

    // Deploy Test instance in devnet, with my deployer
    const testClassHash = "0xff0378becffa6ad51c67ac968948dbbd110b8a8550397cf17866afebc6c17d";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/test.json").toString("ascii"));
    const deployerParams = stark.compileCalldata({ class_hash: testClassHash, params: [] });
    const deployResponse = await account0.execute({ contractAddress: deployDeployerResponse.deploy.address, entrypoint: "deploy_contract", calldata: deployerParams });
    const txReceiptDeployTest = await provider.waitForTransaction(deployResponse.transaction_hash);
    const event = txReceiptDeployTest.events.find(
        (it: any) => number.cleanHex(it.from_address) === number.cleanHex(deployDeployerResponse.deploy.address)
    )

    // Connect the new contract :
    const myTestContract = new Contract(compiledTest.abi, event.data[0], provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
