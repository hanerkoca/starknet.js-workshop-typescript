// declare & deploy a contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA2/5.declareDeployContractOZ.ts

import { Provider, Account, Contract, ec, json, stark, uint256, shortString } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 

    const provider = new Provider({ sequencer: { network: "goerli-alpha" } });

    const privateKey0 = "1202422677688430114213521431078907413426836022101021128058478935525263950730";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = "0x065A822fBeE1Ae79e898688b5A4282Dc79E0042cbEd12F6169937FdDb4c26641";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing AX account4 connected.\n');

    // Declare & deploy Test contract in devnet
    const testClassHash = "0x795be772eab12ee65d5f3d9e8922d509d6672039978acc98697c0a563669e8";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/ERC20MintableOZ051.json").toString("ascii"));
    const initialTk: uint256.Uint256 = { low: "10000000000000000000", high: "0" };
    const ERC20ConstructorCallData = stark.compileCalldata({ name: shortString.encodeShortString('JStoken'), symbol: shortString.encodeShortString('JST'), decimals: "18", initial_supply: { type: 'struct', low: initialTk.low, high: initialTk.high }, recipient: account0.address, owner: account0.address });
    const deployResponse = await account0.declareDeploy({ contract: compiledTest, constructorCalldata: ERC20ConstructorCallData, classHash: testClassHash, salt: "0x00" });
    // In case of constructor, add for example : ,constructorCalldata: [encodeShortString('Token'),encodeShortString('ERC20'),account.address,],

    // Connect the new contract instance :
    const myTestContract = new Contract(compiledTest.abi, deployResponse.deploy.contract_address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });