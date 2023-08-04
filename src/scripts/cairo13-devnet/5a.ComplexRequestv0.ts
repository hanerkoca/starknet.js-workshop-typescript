// Test a complex input.
// use Starknet.js v5.17.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/cairo13-devnet/5a.ComplexRequestv0.ts

import { Provider, Account, Contract, json, Result, BigNumberish, Calldata, CallData, constants, Call, RawArgsObject, cairo, CairoEnum, CairoOption, CairoResult } from "starknet";
import fs from "fs";
import * as dotenv from "dotenv";
import { CairoCustomEnum } from "starknet";
import { CairoOptionVariant, CairoResultVariant } from "starknet";
dotenv.config();


async function main() {
    
    const compiledTest = json.parse(fs.readFileSync("./compiledContracts/cairo200/ERC20-echo.json").toString("ascii"));
    
    const myCalldata = new CallData(compiledTest.abi);
    const requestNonOrdered = {
      t1: 'demo text1',
      n1: 123,
      k1: [{ a: 1, b: { b: 2, c: cairo.tuple(3, 4, 5, 6) } }], // not ordered
      tl2: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      k2: {
        // named tuple
        t1: 1,
        t2: {
          x2: { y1: 3, y2: 4 }, // not ordered
          x1: 2,
          x3: { tx1: cairo.tuple(5, 6), tx2: { tx21: { tx211: 7, tx212: 8 }, tx22: cairo.tuple(9, 10) } },
        },
        t3: 11,
      },
      u1: { high: 0, low: 5000 }, // not ordered Uint256
      s1: {
        discount_fix_bps: 1,
        discount_transfer_bps: 2,
      },
      s2: {
        info: {
          discount_fix_bps: 1,
          discount_transfer_bps: 2,
        },
        data: 200,
        data2: { min: 1, max: 2 },
      },
      af1: [1, 2, 3, 4, 5, 6],
      au1: [cairo.uint256(1000), cairo.uint256(2000), cairo.uint256(3000), cairo.uint256(4000)],
      as1: [
        { discount_fix_bps: 10, discount_transfer_bps: 11 },
        { discount_fix_bps: 20, discount_transfer_bps: 22 },
      ],
      atmk: [
        { p1: { p1: { y1: 1, y2: 2 }, p2: 3 }, p2: 4 },
        { p1: { p1: { y1: 1, y2: 2 }, p2: 3 }, p2: 4 },
      ],
      atmku: [
        cairo.tuple(cairo.tuple({ y1: 1, y2: 2 }, 3), 4),
        cairo.tuple(cairo.tuple({ y1: 1, y2: 2 }, 3), 4),
        cairo.tuple(cairo.tuple({ y1: 1, y2: 2 }, 3), 4),
      ],
    };

    const callDataFromObject = myCalldata.compile('echo', requestNonOrdered);
    
    console.log(callDataFromObject);

    // const expectedResult = [
    //   '474107654995566025798705',
    //   '123',
    //   '8',
    //   '135049554883004558383340439742929429255072943744440858662311072577337126766',
    //   '203887170123222058415354283980421533276985178030994883159827760142323294308',
    //   '196343614134218459150194337625778954700414868493373034945803514629145850912',
    //   '191491606203201332235940470946533476219373216944002683254566549675726417440',
    //   '150983476482645969577707455338206408996455974968365254240526141964709732462',
    //   '196916864427988120570407658938236398782031728400132565646592333804118761826',
    //   '196909666192589839125749789377187946419246316474617716408635151520594095469',
    //   '2259304674248048077001042434290734',
    //   '1',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '5',
    //   '6',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '5',
    //   '6',
    //   '7',
    //   '8',
    //   '9',
    //   '10',
    //   '11',
    //   '5000',
    //   '0',
    //   '1',
    //   '2',
    //   '1',
    //   '2',
    //   '200',
    //   '1',
    //   '2',
    //   '6',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '5',
    //   '6',
    //   '4',
    //   '1000',
    //   '0',
    //   '2000',
    //   '0',
    //   '3000',
    //   '0',
    //   '4000',
    //   '0',
    //   '2',
    //   '10',
    //   '11',
    //   '20',
    //   '22',
    //   '2',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '3',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    //   '1',
    //   '2',
    //   '3',
    //   '4',
    // ];

}



main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });


    