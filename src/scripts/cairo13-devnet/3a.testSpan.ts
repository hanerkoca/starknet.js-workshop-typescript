
// call a Cairov2.1.0 contract, with Span.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/3a.testSpan.ts

import { Provider, Account, Contract, json, Result, BigNumberish, Calldata, CallData, constants, Call, RawArgsObject, cairo, CairoEnum, CairoOption, CairoResult, Uint256, uint256 } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { CairoCustomEnum } from "starknet";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml' before using this script.
// launch script 3 before this script.
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
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);


    // Connect the  contract instance :
    //          👇👇👇 update address in accordance with result of script 3
    const address = "0x105cab76df5b255a1e52961a011ab8bb27f24af62df43d0f969345098579065";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo210/test_span.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    myTestContract.connect(account0);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    // #[derive(Copy,Drop, Serde)]
    // struct ValsetArgs {
   
    //     validators : Span<EthAddress>,
    //     powers : Span<u64>,
    //     valsetNonce : u256,
    // }

    // #[derive(Drop, Serde)]
    // struct RequestPayload {
    //     routeAmount : u256,
    //     requestIdentifier : u256,
    //     requestTimestamp : u256,
    //     srcChainId : felt252,
    //     routeRecipient : ContractAddress,
    //     destChainId : felt252,
    //     asmAddress : ContractAddress,
    //     requestSender : felt252,
    //     handlerAddress : ContractAddress,
    //     packet : Span<felt252>,
    //     isReadCall: bool,
   
    // }

    const u1:Uint256=cairo.uint256(49);
    const u2:Uint256=cairo.uint256(50);

    type ValsetArgs = {
        validators: BigNumberish[],
        powers: BigNumberish[],
        valsetNonce: Uint256,
    }
    
    type RequestPayload ={
        routeAmount: Uint256,
        requestIdentifier: Uint256,
        requestTimestamp: Uint256,
        srcChainId: BigNumberish,
        routeRecipient: BigNumberish,
        destChainId: BigNumberish,
        asmAddress: BigNumberish,
        requestSender: BigNumberish,
        handlerAddress: BigNumberish,
        packet: BigNumberish[],
        isReadCall: boolean,
    }
    
    const mySetArgs:ValsetArgs ={
        validators: [234,235],
        powers: [562,567,345],
        valsetNonce: u1,
    }
    const myRequest:RequestPayload={
        routeAmount: u2,
        requestIdentifier: u1,
        requestTimestamp: u2,
        srcChainId: 100,
        routeRecipient: 101,
        destChainId: 102,
        asmAddress: 103,
        requestSender: 12,
        handlerAddress: 200,
        packet: [13,14,15],
        isReadCall: true,
    }
    
    // const {calldata}=myTestContract.populate("iReceive", {
    //     currentValset: mySetArgs,
    // _sigs: ["0x49","0x4a"],
    // requestPayload: myRequest,
    // relayerRouterAddress: "0x45deacb",
    // });
    const compiledArr=CallData.compile([
        mySetArgs,
    [u1,u2],
    myRequest,
    456789
    ])

    // "type": "function",
    //       "name": "iReceive",
    //       "inputs": [
    //         {
    //           "name": "_currentValset",
    //           "type": "test_span::test_span::ValsetArgs"
    //         },
    //         {
    //           "name": "_sigs",
    //           "type": "core::array::Array::<core::integer::u256>"
    //         },
    //         {
    //           "name": "requestPayload",
    //           "type": "test_span::test_span::RequestPayload"
    //         },
    //         {
    //           "name": "relayerRouterAddress",
    //           "type": "core::felt252"
    //         }

    console.log("compiled Arr =",compiledArr);

const compiledObj=CallData.compile( {
        currentValset: mySetArgs,
    _sigs: [u1,u2],
    requestPayload: myRequest,
    relayerRouterAddress: 456789,
    });

    console.log("compiled Obj =",compiledObj);

    // const {calldata:calldata2}=myTestContract.populate("iReceive2", {
    //     ch: "0x497821adc",
    //     sp: ["0x6a","0x6b"]
    // });

    // Interact with Span, EthAddress, ClassHash.
    await myTestContract.iReceive(compiledObj);
    //console.log("Result1a =", res1);
    // const res2 = await myTestContract.call("test2", [200]) as CairoCustomEnum;
    // console.log("Result2 =", res2);
    
    // 
    const manualCompiled=
    [
        '2',   '234', '235', '3',
        '562', '567', '345', '49',
        '0',   '2',   '49',  '0',
        '50',  '0',   '50',  '0',
        '49',  '0',   '50',  '0',
        '100', '101', '102', '103',
        '12',  '200', '3',   '13',
        '14',  '15',  '1',   '456789'
      ]

    await myTestContract.call("iReceive", manualCompiled, { parseRequest: false, parseResponse: false });
    // console.log("Result8 =", res8);
    

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });