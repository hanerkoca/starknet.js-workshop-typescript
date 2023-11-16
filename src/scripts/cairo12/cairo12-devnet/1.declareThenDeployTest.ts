// declare & deploy a Cairov2.0.0 contract.
// use Starknet.js v5.14.1, starknet-devnet 0.5.3
// launch with npx ts-node src/scripts/cairo12-devnet/1.declareThenDeployHello.ts

import { Provider, Account, Contract, json ,constants} from "starknet";
import fs from "fs";
import {accountTestnet4privateKey, accountTestnet4Address} from "../../../A1priv/A1priv"
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml --compiler-args "--add-pythonic-hints "' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    //const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing predeployed account 0 of Devnet
    // const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    // const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const privateKey=accountTestnet4privateKey;
    const accountAddress=accountTestnet4Address;
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    //console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // Declare & deploy Test contract in devnet
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.casm.json").toString("ascii"));
    
    const deployResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractClassHash = deployResponse.class_hash;
    console.log('✅ Test Contract declared with classHash =', contractClassHash);
    // class hash = 0x19422a432e2ef921dd5bbf8b065fa8efd08607f89cf9359dd4730bb7285a29f

    await provider.waitForTransaction(deployResponse.transaction_hash);
    
    const { transaction_hash: th2, address } = await account0.deployContract({ classHash: contractClassHash });
    console.log("contract_address =", address);
    await provider.waitForTransaction(th2);

    // Connect the new contract instance :
    if (address) {
        const myTestContract = new Contract(compiledSierra.abi, address, provider);
        console.log('✅ Test Contract connected at =', myTestContract.address);
        // testnet address = 0x33de869eb1905fe503610527c51e245119bd05c231e7165c95d6fb630fe05ff
    }
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });