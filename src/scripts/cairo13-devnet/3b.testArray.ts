
// call a Cairov2.1.0 contract, with Span.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/3b.testArray.ts

import { Provider, Account, Contract, json, Result, BigNumberish, Calldata, CallData, constants, Call, RawArgsObject, cairo, CairoEnum, CairoOption, CairoResult, Uint256, uint256 } from "starknet";

async function main() {

    const u1: Uint256 = cairo.uint256(49);
    const u2: Uint256 = cairo.uint256(50);

    type ValsetArgs = {
        validators: BigNumberish[],
        powers: BigNumberish[],
        valsetNonce: Uint256,
    }

    type RequestPayload = {
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

    const mySetArgs: ValsetArgs = {
        validators: [234, 235],
        powers: [562, 567, 345],
        valsetNonce: u1,
    }
    const myRequest: RequestPayload = {
        routeAmount: u2,
        requestIdentifier: u1,
        requestTimestamp: u2,
        srcChainId: 100,
        routeRecipient: 101,
        destChainId: 102,
        asmAddress: 103,
        requestSender: 12,
        handlerAddress: 200,
        packet: [13, 14, 15],
        isReadCall: true,
    }


    const compiledArr = CallData.compile([
        mySetArgs,
        [u1, u2],
        myRequest,
        456789
    ]);
    console.log("compiled Arr =", compiledArr);


    const compiledObj = CallData.compile({
        currentValset: mySetArgs,
        _sigs: [u1, u2],
        requestPayload: myRequest,
        relayerRouterAddress: 456789,
    });
    console.log("compiled Obj =", compiledObj);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });