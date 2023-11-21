// call a Cairov2.1.0 contract, with enum answer.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/6a.callTestHello.ts

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
    const address = "0x55b8090c68d428862f04a9a99c373f7e40b287110ecf9b9c8a7152aea4b675a";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/hello_res_events_newTypes.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);

    // Span
    const res = await myTestContract.call("new_span", [[1, 3, 5]]);
    console.log("Span call =", res);
    const pop1 = myTestContract.populate("new_span", [[1, 3, 5]]);
    const res2 = await myTestContract.call("new_span", pop1.calldata as Calldata);
    console.log("Span populate array =", res2);
    const pop2 = myTestContract.populate("new_span", { my_span: [1, 3, 5] });
    const res3 = await myTestContract.call("new_span", pop2.calldata as Calldata);
    console.log("Span populate object =", res3);
    const myCalldata = new CallData(compiledTest.abi);
    const comp1 = myCalldata.compile("new_span", { my_span: [1, 3, 5] });
    const res4 = await myTestContract.call("new_span", comp1);
    console.log("Span compile object =", res4);
    const comp2 = myCalldata.compile("new_span", [[1, 3, 5]]);
    const res5 = await myTestContract.call("new_span", comp2);
    console.log("Span compile array =", res5);
    const res6 = await myTestContract.new_span([1, 3, 5]);
    console.log("Span metaClass =", res6);
    const comp3 = CallData.compile([[1, 3, 5]]);
    const res7 = await myTestContract.new_span(comp3);
    console.log("Span CallData.compile array =", res7);
    const comp4 = CallData.compile({ my_span: [1, 3, 5] });
    const res8 = await myTestContract.new_span(comp4);
    console.log("Span CallData.compile object =", res8);

    // ClassHash, EthAddress, ContractAddress
    const addrs = await myTestContract.new_types(256, "0x1234567890", "0xe3456");
    console.log("EthAddress metaClass =", addrs);
    const pop3 = myTestContract.populate("new_types", {
        ch: 123456789n,
        eth_addr: 987654321n, contr_address: 567890n
    });
    const res9 = await myTestContract.call("new_types", pop3.calldata as Calldata);
    console.log("EthAddress populate object =", res9);

    // tuple of arrays of ClassHash, EthAddress, ContractAddress
    const res10 = await myTestContract.array_new_types(
        cairo.tuple(256, "0x1234567890", "0xe3456"),
        cairo.tuple(["0x1234567890", "0xe3456"], ["0x1234567890", "0xe3456"], ["0x1234567890", "0xe3456"]));
    console.log("Array Contractaddress metaClass =", res10);
    
    const comp5 = myTestContract.populate("array_new_types", [
        cairo.tuple(256, "0x1234567890", "0xe3456"),
    cairo.tuple(["0x1234567890", "0xe3456"], ["0x1234567891", "0xe3457"], ["0x1234567892", "0xe3458"])]);
    const res11 = await myTestContract.call("array_new_types", comp5.calldata as Calldata);
    console.log("Array Contractaddress populate array =", res11);
    
    const comp6 = myTestContract.populate("array_new_types", {
        tup:cairo.tuple(256, "0x1234567890", "0xe3456"),
        tupa:cairo.tuple( ["0x1234567890", "0xe3456"],
         ["0x1234567891", "0xe3457"],
        ["0x1234567892", "0xe3458"])
    });
    const res12 = await myTestContract.call("array_new_types", comp6.calldata as Calldata);
    console.log("Array Contractaddress populate object =", res12);

    const comp7 = CallData.compile([cairo.tuple(256, "0x1234567890", "0xe3456"),
    cairo.tuple(["0x1234567890", "0xe3456"], ["0x1234567891", "0xe3457"], ["0x1234567892", "0xe3458"])]);
    const res13 = await myTestContract.call("array_new_types", comp7);
    console.log("Array Contractaddress CallData array =", res13);

    const comp8 = CallData.compile({
        tup:cairo.tuple(256, "0x1234567890", "0xe3456"),
        tupa:cairo.tuple( ["0x1234567890", "0xe3456"],
         ["0x1234567891", "0xe3457"],
        ["0x1234567892", "0xe3458"])
    });
    const res14 = await myTestContract.call("array_new_types", comp8);
    console.log("Array Contractaddress CallData object =", res14);

    const comp9 = myCalldata.compile("array_new_types",{
        tup:cairo.tuple(256, "0x1234567890", "0xe3456"),
        tupa:cairo.tuple( ["0x1234567890", "0xe3456"],
         ["0x1234567891", "0xe3457"],
        ["0x1234567892", "0xe3458"])
    } );
    const res15 = await myTestContract.call("array_new_types", comp9);
    console.log("Array Contractaddress myCalldata object =", res15);

    const comp10 = myCalldata.compile("array_new_types",[cairo.tuple(256, "0x1234567890", "0xe3456"),
    cairo.tuple(["0x1234567890", "0xe3456"], ["0x1234567891", "0xe3457"], ["0x1234567892", "0xe3458"])] );
    const res16 = await myTestContract.call("array_new_types", comp10);
    console.log("Array Contractaddress myCalldata object =", res16);

    const res17 = await myTestContract.call("array_contract_addr", [["0x1234567892", "0xe3458"]]);
    console.log("Array Contractaddress call =", res17);

    console.log('✅ Test completed.');

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });