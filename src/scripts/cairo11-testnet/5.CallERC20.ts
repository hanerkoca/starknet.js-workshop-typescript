// connect a contract that is already deployed on devnet.
// launch with npx ts-node src/scripts/cairo11-testnet/5.CallERC20.ts
// Coded with Starknet.js v5.17.0

import { constants, Provider, Contract, Account, json, shortString } from "starknet";
import fs from "fs";
import { accountTestnet4Address, accountTestnet4privateKey } from "../../A1priv/A1priv";

async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { network: constants.NetworkName.SN_GOERLI } });

    // initialize existing Argent X account
    const account0Address = accountTestnet4Address;
    console.log('Braavos1_ACCOUNT_ADDRESS=', account0Address);
    const account0 = new Account(provider, account0Address, accountTestnet4privateKey);
    console.log('existing account connected.\n');

    // Connect the deployed Test instance in devnet
    const testAddress="0x07bca49a461a23a612b16941ed3ef6b6e18317f438324c5d3887c1cb8d6a2c7c";
    const compiledTest = await provider.getClassAt(testAddress);
    fs.writeFileSync('./compiledContracts/erc20test.sierra.json', json.stringify(compiledTest, undefined, 2));
    const myTestContract = new Contract(compiledTest.abi, testAddress, provider);
    myTestContract.connect(account0);
    console.log('Test Contract connected at =', myTestContract.address);

    // Interactions with the contract with call & invoke
    const res1 = await myTestContract.get_name();
    console.log("get_name =",shortString.decodeShortString(res1));
    const res2 = await myTestContract.get_symbol();
    console.log("get_symbol =",shortString.decodeShortString(res2));
    const res3 = await myTestContract.get_decimals();
    console.log("get_decimals =",res3);
    
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });