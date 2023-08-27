// deploy in devnet the Cairo 2.2.0 OZ account.
// launch with npx ts-node src/scripts/cairo12-devnet/11.deployOZ070account.ts
// Coded with Starknet.js v5.17.0

import { constants, Provider, Contract, Account, json, shortString, RpcProvider, ec, CallData ,hash} from "starknet";
import fs from "fs";
import axios from "axios";

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml' before using this script (with Cairo 2.2.0 fetched and built).
//          👆👆👆

async function main() {

    // initialize Provider 
    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" });
    // const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    // const provider = new RpcProvider({ nodeUrl: "http://192.168.1.99:9545/rpc/v0.4" });

    // Check that communication with provider is OK
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);

    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);

    console.log("A")
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo220/accountOZ070.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo220/accountOZ070.casm.json").toString("ascii"));


    const privateKeyOZ = "0x987654321aabbccddeeff";
    const starkKeyPubOZ = ec.starkCurve.getStarkKey(privateKeyOZ);

    const declareResponse = await account0.declare({ contract: compiledSierra, casm: compiledCasm });
    const contractOZ070ClassHash = declareResponse.class_hash;
    // const contractClassHash = "0x2bfd9564754d9b4a326da62b2f22b8fea7bbeffd62da4fcaea986c323b7aeb";
    console.log('✅ OZ 070 account contract declared with classHash =', contractOZ070ClassHash);
    await provider.waitForTransaction(declareResponse.transaction_hash);

    const accountOZconstructorCallData = CallData.compile({ publicKey: starkKeyPubOZ });
    const contractOZaddress = hash.calculateContractAddressFromHash( starkKeyPubOZ,contractOZ070ClassHash, accountOZconstructorCallData, 0);
    console.log('Precalculated account address=', contractOZaddress);
    // fund account address before account creation
        
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": contractOZaddress, "amount": 50_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer); //50 ETH

    console.log("Deploy of contract in progress...");
    const accountOZ = new Account(provider, contractOZaddress, privateKeyOZ,"1");
    const { transaction_hash:th2, contract_address:accountOZAddress } = await accountOZ.deployAccount({ 
        classHash: contractOZ070ClassHash, 
        constructorCalldata: accountOZconstructorCallData, 
        addressSalt: starkKeyPubOZ 
    });
    console.log("Account deployed at address =",accountOZAddress);
    // account OZ 070 = "0x06c9cb47e3bb345fcccbba0fc51bac5c706701523a20f203b11dbb66bd648612"
    await provider.waitForTransaction(th2);

    

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });