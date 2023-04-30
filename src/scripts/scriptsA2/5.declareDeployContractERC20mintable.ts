// declare & deploy a contract.
// use of OZ deployer
// launch with npx ts-node src/scriptsA2/5.declareDeployContractOZ.ts

import { Provider, Account, Contract, ec, json, stark, shortString, uint256 } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();


async function main() {
    //initialize Provider 

    const provider = new Provider({ sequencer: { network: "goerli-alpha-2" } });

    //console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // connect existing predeployed account 0 of Devnet
    // console.log('OZ_ACCOUNT0_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    // console.log('OZ_ACCOUNT0_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey0 = "0x0217aec50b2c3ef512c0c4b27122d312d8fcf0125701319f360d79c159e05415";
    const starkKeyPair0 = ec.getKeyPair(privateKey0);
    const account0Address: string = "0x3c814156eebd2159107c0b7d9871d2da2ab54b0dab14d4609a6a8514164bc1a";
    const account0 = new Account(provider, account0Address, starkKeyPair0);
    console.log('existing OZ account0 connected.\n');

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