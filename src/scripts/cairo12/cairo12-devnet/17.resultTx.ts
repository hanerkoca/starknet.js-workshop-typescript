// Enum like for tx response
// launch with : npx ts-node src/scripts/cairo12/cairo12-devnet/17.resultTx.ts
// Coded with Starknet.js v5.21.0

import { Provider, RpcProvider, SequencerProvider, constants, Account, ec, json, stark, hash, CallData, Contract, cairo, SuccessfulTransactionReceiptResponse, RejectedTransactionReceiptResponse, RevertedTransactionReceiptResponse } from "starknet";
import { infuraKey } from "../../../A-MainPriv/mainPriv";
import { account7TestnetPrivateKey, junoNMtestnet, account5TestnetAddress, account5TestnetPrivateKey } from "../../../A1priv/A1priv";
import { addrETH } from "../../../A2priv/A2priv";

import fs from "fs";
import axios from "axios";
import * as dotenv from "dotenv";
import { resetDevnetNow } from "../../resetDevnetFunc";
dotenv.config();


// export interface Success {
//     tag: "success"
//     value: SuccessfulTransactionReceiptResponse
// }
// export interface Rejected {
//     tag: "rejected"
//     value: RejectedTransactionReceiptResponse
// }
// export interface Reverted {
//     tag: "reverted"
//     value: RevertedTransactionReceiptResponse
// }
// export type ResultTx = Success | Rejected | Reverted;

// export namespace ResultTx {
//     class Success implements Success {
//         public tag: "success" = "success";
//         public value: SuccessfulTransactionReceiptResponse;
//         public constructor(val: SuccessfulTransactionReceiptResponse) {
//             this.value = val
//         }
//     }
//     class Rejected implements Rejected {
//         public tag: "rejected" = "rejected";
//         public value: RejectedTransactionReceiptResponse;
//         public constructor(val: RejectedTransactionReceiptResponse) {
//             this.value = val
//         }
//     }
//     class Reverted implements Reverted {
//         public tag: "reverted" = "reverted";
//         public value: RevertedTransactionReceiptResponse;
//         public constructor(val: RevertedTransactionReceiptResponse) {
//             this.value = val
//         }
//     }
// }

interface Matchable<T> {
    match<E>(fns: { some: (t: T) => E, none: () => E }): E;
}

export interface Some<T>  {
    tag: "some"
    value: T
}

export interface None  {
    tag: "none"
}

export type Option<T> = (Some<T> | None) //& Matchable<T>

export namespace Option {
    // interface Some<T> {
    //     tag: "some"
    //     value: T
    // }
    
    // interface None {
    //     tag: "none"
    // }
    
    // type Option<T> = (Some<T> | None) 

    class Some<T> implements Some<T> {
        public tag: "some" = "some"
        public value: T

        public constructor(val: T) {
            this.value = val
        }

        public toString() {
            return `Some{ ${this.value} }`
        }
    }

    class None implements None {
        public tag: "none" = "none"

        public toString() {
            return `None { }`
        }
    }


export function none(): None {
    return new None()
}

export function of<T>(val: T): Option<T> {
    if (val === null || val === undefined) {
        return Option.none()
    }

    return new Some(val)
}

}

// const val:number=23;
const val:string="abc";
const maybe=Option.of(val);
const maybe2=Option.of(null);
console.log("maybe=",maybe,maybe2);
// maybe.match({
//     some(num:number){console.log("some=",num)},
//     none(){console.log("problem")}
// })


async function main() {

    const provider = new RpcProvider({ nodeUrl: "http://127.0.0.1:5050/rpc" }); // only for starknet-devnet-rs
    resetDevnetNow();
    console.log("Provider connected to Starknet-devnet-rs");

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey0 = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress0: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account0 = new Account(provider, accountAddress0, privateKey0);
    console.log("Predeployed account 0 connected.\n");





    const v=account0.getCairoVersion()

    console.log('✅ contract deployed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });