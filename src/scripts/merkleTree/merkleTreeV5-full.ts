// Test a Merkle tree
// launch with npx ts-node src/scripts/merkleTree/merkleTreeV5.ts

import { Account, ec, hash, Provider, number, json, Contract, encode, Signature, typedData, uint256 } from "starknet";
import * as dotenv from "dotenv";
import fs from "fs";
import { BigNumberish } from "starknet/src/utils/number";
import BN from "bn.js";
import * as merkle from './merkle';
dotenv.config();

//    👇👇👇
// 🚨 launch 'starknet-devnet --seed 0' before using this script
//    👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    // const starkKeyPair0 = ec.starkCurve.(privateKey0);
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, privateKey0);
    console.log('✅ OZ predeployed account 0 connected.');

    // create MERKLE TREE. To perform once.
    
    const airdrop: merkle.inputForMerkle[] = [
        ['0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79', '256'],
        ['0x3cad9a072d3cf29729ab2fad2e08972b8cfde01d4979083fb6d15e8e66f8ab1', '25'],
        ['0x27d32a3033df4277caa9e9396100b7ca8c66a4ef8ea5f6765b91a7c17f0109c', '56'],
        ['0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a', '26'],
        ['0x53c615080d35defd55569488bc48c1a91d82f2d2ce6199463e095b4a4ead551', '56'],
      ];
    const tree1=merkle.StarknetMerkleTree.create(airdrop);
    console.log("root =",tree1.root); // for smartcontract constructor
    fs.writeFileSync('src/scripts/merkleTree/treeTest.json', JSON.stringify(tree1.dump()));

    // Connect the deployed contract in devnet
    //    👇👇👇
    const testAddress = "0x13af6ca02e474d6dd0f5043f491754141a4cde4d6e63ce6adfd45a215bff30f"; // modify
    //    👆👆👆
    
    // recover the saved merkle tree
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/merkle-verify.json").toString("ascii"));
    const myContract = new Contract(compiledTest.abi, testAddress, provider);
    console.log('Contract connected at =', myContract.address);

    const tree = merkle.StarknetMerkleTree.load(
        JSON.parse(fs.readFileSync('./src/scripts/merkleTree/treeTest.json', 'ascii'))
    );
    tree.validate(); // if necessary
    const inp = ['0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a', '26'];

    console.log(inp);
    const leafHash = merkle.StarknetMerkleTree.leafHash(inp);
    console.log("leafHash =", leafHash);
    const proof = tree.getProof(inp);


    // Inetractions with the contract with call & invoke
    myContract.connect(account);
    const result1 = await myContract.verify_proof(leafHash, proof);
    // const idxResponse = Object.values(result1);
    // console.log("Result =", "0x" + result1.res.toString(16));
    console.log("result1 =", result1.res);
    // console.log("idxResponse =", idxResponse);
    let airdropPerformed: boolean;
    try {
        await myContract.invoke("request_airdrop", [...inp, proof]);
        airdropPerformed = true
    }
    catch {
        airdropPerformed = false
    }
    console.log("Result =", airdropPerformed);
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });