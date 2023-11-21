// call a Cairov2.1.0 contract, with enum answer.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/2.callTestOptionResult.ts

import { Provider, Account, Contract, json, Result, BigNumberish, Calldata, CallData, constants, Call, RawArgsObject, cairo, CairoEnum, CairoOption, CairoResult } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { CairoCustomEnum } from "starknet";
import { CairoOptionVariant, CairoResultVariant } from "starknet";
dotenv.config();

type Order = {
    p1: BigNumberish,
    p2: BigNumberish,
}
type Order2 = {
    p21: BigNumberish,
    p22: Order,
}
async function main() {
    
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo200/complexInput.json").toString("ascii"));

    const myCalldata = new CallData(compiledTest.abi);
    const ord1: Order = { p2: 2, p1: 1 };
    const ord2: Order = { p1: 3, p2: 4 };
    const obj1: Order2 = { p22: ord1, p21: 10 };
    const obj2: Order2 = { p21: 20, p22: ord2 };
    const myArgs = {
        array3: [obj1, obj2]
    };

    const myCall1 = myCalldata.compile("test1",{p1:10});
    console.log(myCall1);

    const myCall=myCalldata.compile("constructor",myArgs);
    console.log(myCall);
    
    const myCall2 = myCalldata.compile("test2",{
        inp: {p2:20,p1:10}
    });
    console.log(myCall2);
    
    const myCall3 = myCalldata.compile("test3", {
        inp: {
            p21: "0x100",
            p22: { p2: 20, p1: 10 }
        }
    });
    console.log(myCall3);

    const myOpt=new CairoOption<Order2>(CairoOptionVariant.Some,{
                 p22: { p2: 20, p1: 10 },
                 p21: "0x100",
             });
    const myCall4 = myCalldata.compile("test5", {
        inp: myOpt
        }
    );
    console.log(myCall4);


    // test array
    const myCallArray0 = myCalldata.compile("arr_longtext", {
        inp: "aaaaaaaa bbbbbbb cccccc dddddd eeeeee"
        }
    );
    console.log(myCallArray0);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
