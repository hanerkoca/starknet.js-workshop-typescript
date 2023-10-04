// Test account abstraction of Cairo 1 account.
// use Starknet.js v5.19.5 (+ commit), starknet-devnet 0.6.2
// launch with npx ts-node src/scripts/cairo12-devnet/14a.testAccountAbstraction.ts

import { Provider, Account, Calldata, AbstractedSigner, BigNumberish, ec, hash, json, CallData, Contract, cairo, TypedData, WeierstrassSignatureType, Signature, ArraySignatureType, encode } from "starknet";
import { abstractionFns } from "./14b.myAccountAbstractionMod";
import fs from "fs";
import axios from "axios";


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0' and script 14 before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey0 = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress0: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey0);

    // ETH contract
    const compiledSierraETH = json.parse(fs.readFileSync("./compiledContracts/cairo060/erc20ETH.json").toString("ascii"));
    const addressETH = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
    const contractETH = new Contract(compiledSierraETH.abi, addressETH, provider);

    // ********* Abstracted transactions 
    const privateKeyAbstraction = "0x7aadb6605c9538199797920884694b5ce84fc68f92c832b0";
    const addressAbstraction = "0x02f5f0607b5059cc907375bd936d40faf9695a58dd5f73b413922a80bf279428";
    const signerAbstraction = new AbstractedSigner(privateKeyAbstraction, abstractionFns);
    const starkKeyPubAbstraction = ec.starkCurve.getStarkKey(privateKeyAbstraction);
    const fullPublicKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privateKeyAbstraction, false)));
    const accountAbstraction = new Account(provider, addressAbstraction, signerAbstraction, "1");
    const compiledSierraAccount = json.parse(fs.readFileSync("./compiledContracts/cairo210/account_abstraction.sierra.json").toString("ascii"));
    const myAccountContract = new Contract(compiledSierraAccount.abi, accountAbstraction.address, provider);
    contractETH.connect(accountAbstraction);

    const bal0 = await contractETH.balanceOf(addressAbstraction);
    console.log("Initial balance =", bal0);

    const { transaction_hash: th1 } = await contractETH.invoke(
        "transfer",
        [
            accountAddress0,
            cairo.uint256(200_000)
        ],
        undefined,
        4, 5, 6);
    console.log("Tx1 OK.");
    await provider.waitForTransaction(th1);
    const bal1 = await contractETH.balanceOf(addressAbstraction);
    console.log("balance1 =", bal1);

    const call2 = contractETH.populate("transfer", {
        recipient: accountAddress0,
        amount: cairo.uint256(300_000)
    })
    const { transaction_hash: th2 } = await accountAbstraction.execute(
        call2,
        undefined,
        undefined,
        4, 5, 6);
    console.log("Tx2 OK.");
    await provider.waitForTransaction(th2);
    const bal2 = await contractETH.balanceOf(addressAbstraction);
    console.log("balance2 =", bal2);

    console.log("✅ Abstracted transaction test completed");

    // ************* Abstracted declare & deploy contract
    const compiledSierra = json.parse(fs.readFileSync("./compiledContracts/cairo200/erc20/erc20.sierra.json").toString("ascii"));
    const compiledCasm = json.parse(fs.readFileSync("./compiledContracts/cairo200/erc20/erc20.casm.json").toString("ascii"));

    // declare
    const declareResponse = await accountAbstraction.declare(
        { contract: compiledSierra, casm: compiledCasm },
        undefined,
        7, 8, 9

    );
    const classHashERC20 = declareResponse.class_hash;
    console.log("ERC20 Class Hash =", classHashERC20);
    // deploy
    const myCallDataERC20 = new CallData(compiledSierra.abi);
    const constructorERC20: Calldata = myCallDataERC20.compile("constructor", {
        name_: "Critical",
        symbol_: "CDF",
        decimals_: 2,
        initial_supply: cairo.uint256(100_000),
        recipient: account0.address
    });
    const respDeploy = await accountAbstraction.deploy({
        classHash: classHashERC20,
        constructorCalldata: constructorERC20
    },
        undefined,
        4, 5, 6); // abstraction is here
    console.log("ERC20 address =", respDeploy.contract_address);
    await provider.waitForTransaction(respDeploy.transaction_hash);
    // declareAndDeploy
    const compiled2Sierra = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_signature.sierra.json").toString("ascii"));
    const compiled2Casm = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_signature.casm.json").toString("ascii"));

    const response = await accountAbstraction.declareAndDeploy(
        { contract: compiled2Sierra, casm: compiled2Casm },
        undefined,
        [7, 8, 9], // abstraction for declare
        [4, 5, 6]  // abstraction for deploy
    );
    console.log("Declare&deploy. ClassHash =", response.declare.class_hash, "\naddress =", response.deploy.address);
    console.log("✅ Abstracted declare/deploy contract tests completed");


    // ************ Abstracted message
    const typedDataValidate: TypedData = {
        domain: {
            chainId: "Starknet Mainnet",
            name: "Dappland",
            version: "1.0",
        },
        message: {
            MessageId: 345,
            From: {
                Name: "Edmund",
                Address: "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
            },
            To: {
                Name: "Alice",
                Address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
            },
            Nft_to_transfer: {
                Collection: "Stupid monkeys",
                Address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
                Nft_id: 112,
                Negociated_for: {
                    Qty: "18.4569325643",
                    Unit: "ETH",
                    Token_address: "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
                    Amount: 18456932564300000000n,
                }
            },
            Comment1: "Monkey with banana, sunglasses,",
            Comment2: "and red hat.",
            Comment3: "",
        },
        primaryType: "TransferERC721",
        types: {
            Account1: [
                {
                    name: "Name",
                    type: "string",
                },
                {
                    name: "Address",
                    type: "felt",
                },
            ],
            Nft: [
                {
                    name: "Collection",
                    type: "string",
                },
                {
                    name: "Address",
                    type: "felt",
                },
                {
                    name: "Nft_id",
                    type: "felt",
                },
                {
                    name: "Negociated_for",
                    type: "Transaction",
                },
            ],
            Transaction: [
                {
                    name: "Qty",
                    type: "string",
                },
                {
                    name: "Unit",
                    type: "string",
                },
                {
                    name: "Token_address",
                    type: "felt",
                },
                {
                    name: "Amount",
                    type: "felt",
                },
            ],
            TransferERC721: [
                {
                    name: "MessageId",
                    type: "felt",
                },
                {
                    name: "From",
                    type: "Account1",
                },
                {
                    name: "To",
                    type: "Account1",
                },
                {
                    name: "Nft_to_transfer",
                    type: "Nft",
                },
                {
                    name: "Comment1",
                    type: "string",
                },
                {
                    name: "Comment2",
                    type: "string",
                },
                {
                    name: "Comment3",
                    type: "string",
                },

            ],
            StarkNetDomain: [
                {
                    name: "name",
                    type: "string",
                },
                {
                    name: "chainId",
                    type: "felt",
                },
                {
                    name: "version",
                    type: "string",
                },
            ],
        },
    };
    // myAccount.hashMessage() do not handle Account Abstraction ; use myAccount.signMessage()
    const signature = await accountAbstraction.signMessage(typedDataValidate, 10, 11, 12);
    const sign = signature as ArraySignatureType;
    // myAccount.verifyMessageHash() do not handle Account Abstraction ; use myAccount.verifyMessage()
    const res1: boolean = await accountAbstraction.verifyMessage(typedDataValidate, signature, 10,11,12); // in Starknet network
    console.log("Result verif message on-chain (boolean) =", res1);
    const msgHash2 = await accountAbstraction.hashMessage(typedDataValidate, 10, 11, 12); // in Starknet.js
    const res2: boolean = await accountAbstraction.verifyMessageHash(msgHash2, signature); // in Starknet network
    console.log("Result verif Hash on-chain (boolean) =", res2);
    const res3: boolean = await accountAbstraction.verifyMessageLocally(typedDataValidate, sign, fullPublicKey, 10, 11, 12);
    console.log("Message verified locally in Starknet.js :", res3);
    console.log("✅ Abstracted message tests completed");


    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
