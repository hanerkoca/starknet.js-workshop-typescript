// call a Cairov2.0.0 contract, with enum answer.
// use Starknet.js v5.14.1, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo12-devnet/3.callTest.ts

import { Provider, Account, Contract, json, Result, BigNumberish, Calldata, CallData, constants } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --cairo-compiler-manifest /D/Cairo1-dev/cairo/Cargo.toml --compiler-args "--add-pythonic-hints "' before using this script.
// launch script 1 before this script.
//          👆👆👆
type Order = {
    p1: BigNumberish,
    p2: BigNumberish,
}

const DeserializeOrder = (input: bigint[]): Order => { return { p1: input[0], p2: input[1] } };
const DeserializeBigint = (input: bigint[]): bigint => { return input[0] };

enum CairoResult {
    Ok = 0,
    Err = 1,
}

class MyResult<T, U> {
    readonly Ok?: T;
    readonly Err?: U;

    constructor(option: CairoResult, input: BigNumberish[], DeserealizeOk: Function, DeserializeErr: Function) {
        const input3: bigint[] = input.map(val => BigInt(val));
        switch (option) {
            case CairoResult.Ok:
                this.Ok = DeserealizeOk(input3) as T;
                break;
            case CairoResult.Err:
                this.Err = DeserializeErr(input3) as U;
                break;
            default:
                throw new Error("option is out of range.")
                break;
        }
    }
    public isOk(): boolean {
        return !((typeof this.Ok) === "undefined")
    }
    public isErr(): boolean {
        return !((typeof this.Err) === "undefined")
    }
    public unwrap(): T | undefined { return this.Ok }
}

enum CairoOption {
    Some = 0,
    None = 1,
}
class MyOption<T> {
    readonly Some?: T;
    readonly None?: boolean;

    constructor(option: CairoOption, input: BigNumberish[], DeserealizeSome: Function) {
        const input3: bigint[] = input.map(val => BigInt(val));
        switch (option) {
            case CairoOption.Some:
                this.Some = DeserealizeSome(input3) as T;
                break;
            case CairoOption.None:
                this.None = true;
                break;
            default:
                throw new Error("option is out of range.")
                break;
        }
    }
    public isSome(): boolean {
        return !((typeof this.Some) === "undefined")
    }
    public isNone(): boolean {
        return this.None === true
    }
    public unwrap(): T | undefined { return this.Some }
}

async function main() {
    const re1: Order = { p1: 21, p2: 110 };
    const myResult1 = new MyResult<Order, bigint>(CairoResult.Ok, CallData.compile([re1]), DeserializeOrder, DeserializeBigint);
    console.log("resul1  =", myResult1);
    const re2: bigint = 2n;
    const myResult2 = new MyResult<Order, bigint>(CairoResult.Err, CallData.compile([re2]), DeserializeOrder, DeserializeBigint);
    console.log("result2  =", myResult2);

    const op1: Order = { p1: 11, p2: 12 };
    const myOption1 = new MyOption<Order>(CairoOption.Some, CallData.compile(op1), DeserializeOrder);
    console.log("option1  =", myOption1);
    // const op2: bigint[] = [1n];
    const myOption2 = new MyOption<Order>(CairoOption.None, [], DeserializeOrder);
    console.log("option2  =", myOption2);

    //initialize Provider 
    // const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // Declare & deploy Test contract in devnet


    // Connect the  contract instance :
   //          👇👇👇 update address in accordance with result of script 1
    const address = "0x033de869eb1905fe503610527c51e245119bd05c231e7165c95d6fb630fe05ff";
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo200/PhilTest2.sierra.json").toString("ascii"));
    const myTestContract = new Contract(compiledTest.abi, address, provider);
    console.log('✅ Test Contract connected at =', myTestContract.address);

    const res1 = await myTestContract.call("test2", [10], { parseRequest: false, parseResponse: false })as unknown as string[];
    console.log("Result1 =", res1, " type =", typeof (res1), " isArray =", Array.isArray(res1));
   
    const res2: Result | string[] = await myTestContract.call("test2", [200], { parseRequest: false, parseResponse: false });
    console.log("Result2 =", res2);
    const res3: Result | string[] = await myTestContract.call("test2", [100], { parseRequest: false, parseResponse: false });
    console.log("Result3 =", res3);

    // return an option<litteral>
    const res4: Result | string[] = await myTestContract.call("test3", [50], { parseRequest: false, parseResponse: false });
    console.log("Result4 =", res4);
    const res5: Result | string[] = await myTestContract.call("test3", [128], { parseRequest: false, parseResponse: false });
    console.log("Result5 =", res5);

    // return an option<struct>
    const res6: Result | string[] = await myTestContract.call("test4", [50], { parseRequest: false, parseResponse: false });
    console.log("Result6 =", res6);
    const res7: Result | string[] = await myTestContract.call("test4", [128], { parseRequest: false, parseResponse: false });
    console.log("Result7 =", res7);

    // option as input
    const res8: Result | string[] = await myTestContract.call("test5", [0, 10, 11], { parseRequest: false, parseResponse: false });
    console.log("Result8 =", res8);
    const res9: Result | string[] = await myTestContract.call("test5", [1], { parseRequest: false, parseResponse: false });
    console.log("Result9 =", res9);

    // // return  a Result<litteral>
    // const res10: Result | string[] = await myTestContract.call("test6", [90], { parseRequest: false, parseResponse: false });
    // console.log("Result10 =", res10);
    // const res11: Result | string[] = await myTestContract.call("test6", [110], { parseRequest: false, parseResponse: false });
    // console.log("Result11 =", res11);

    // // return  a Result<Order>
    // const res12: Result | string[] = await myTestContract.call("test7", [91], { parseRequest: false, parseResponse: false });
    // console.log("Result12 =", res12);
    // const res13: Result | string[] = await myTestContract.call("test7", [111], { parseRequest: false, parseResponse: false });
    // console.log("Result13 =", res13);

    // // return  a Result<Order>
    // const res14: Result | string[] = await myTestContract.call("test8", [0, 92, 93], { parseRequest: false, parseResponse: false });
    // console.log("Result14 =", res14);
    // const res15: Result | string[] = await myTestContract.call("test8", [1, 112], { parseRequest: false, parseResponse: false });
    // console.log("Result15 =", res15);


}




main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });