// call a Cairov2.1.0 contract.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node s

import { Account, BigNumberish, CallData, Calldata, Contract, Provider, WeierstrassSignatureType , cairo, json, types} from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import * as weierstrass from '@noble/curves/abstract/weierstrass';
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml' before using this script.
// launch script 1 before this script.
//          👆👆👆


type Order = {
    p1: BigNumberish,
    p2: BigNumberish,
}

async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    // const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);

    // Connect the  contract instance :
    //          👇👇👇 update address in accordance with result of script 6
    const address = "0x6fe4f585cd69f3a4b00086f4025dca390a10680005d93ee2ff8984abde0ac2e";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/cairo210.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);

  
    const res = await myTestContract.call("test_felt", [1, 100, 5]);
    console.log("test with 100 =", res);
    const res2 = await myTestContract.call("test_felt", [1, 50, 5]);
    console.log("test with 5.0 =", res2);

    console.log('✅ Test completed.');

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });