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
    //const testClassHash = "0xff0378becffa6ad51c67ac968948dbbd110b8a8550397cf17866afebc6c17d";
    const compiledHelloSierra = json.parse(fs.readFileSync("./compiledContracts/hello.sierra").toString("ascii"));
    const compiledHelloCasm = json.parse(fs.readFileSync("./compiledContracts/hello.casm").toString("ascii"));
    const deployResponse = await account0.declare({ contract: compiledHelloSierra, casm: compiledHelloCasm });
    // In case of constructor, add for example : ,constructorCalldata: [encodeShortString('Token'),encodeShortString('ERC20'),account.address,],

    // Connect the new contract instance :
    // const myTestContract = new Contract(compiledHelloSierra.abi, deployResponse.deploy.contract_address, provider);
    // console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });