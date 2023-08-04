// call a Cairov2.1.0rc4 contract, to verify a signature.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/signature/3a.verifCairo.ts

import { Account, BigNumberish, CallData, Calldata, Contract, Provider, WeierstrassSignatureType, cairo, json, hash, ec, types, encode } from "starknet";
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
    //          👇👇👇 update address in accordance with result of script 3
    const address = "0x43e0e72bc2f90fd9086f7157638f6b217302f7e322524ebc330504aa1066cbd";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_signature.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);

    const message: BigNumberish[] = [50, 100, 150, 200];
    const fullPubKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))); // complete
    const starknetPubKey = ec.starkCurve.getStarkKey(privateKey); // only X part

    const msgHash = hash.computeHashOnElements(message);
    const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey);



    // local
    const verifStarknet = ec.starkCurve.verify(signature, msgHash, fullPubKey);
    console.log('Is Signature verified in local =', verifStarknet);
    const sig:BigNumberish[]=[signature.r,signature.s];
console.log("signature =",sig);
    // in Cairo v2
    const res=await myTestContract.verify_signature(msgHash,starknetPubKey,sig);
    console.log("Is signature verified in Cairo v2 =",res);

    console.log('✅ Test completed.');

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });