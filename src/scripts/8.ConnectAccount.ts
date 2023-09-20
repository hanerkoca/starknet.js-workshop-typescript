// Connect an existing account in devnet.
// launch with : npx ts-node src/scripts/8.ConnectWallet.ts
// Coded with Starknet.js v5.16.0

import { Account, Provider } from "starknet";
import * as dotenv from "dotenv";
dotenv.config();


//        👇👇👇
// 🚨🚨🚨 launch 'starknet-devnet --seed 0' before using this script
//         and also script 2, to create an account.
//        👆👆👆
async function main() {
    //initialize Provider with DEVNET, reading .env file
    if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
        console.log("This script work only on local devnet.");
        process.exit(1);
    }
    const provider = new Provider({ sequencer: { baseUrl: process.env.STARKNET_PROVIDER_BASE_URL } });
    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);
    // connect an existing OZ wallet
    const privateKeyOZaccount = process.env.OZ_NEW_ACCOUNT_PRIVKEY ?? "";
    const OZaccountAddress = process.env.OZ_NEW_ACCOUNT_ADDRESS ?? "";
    const OZaccount = new Account(provider, OZaccountAddress, privateKeyOZaccount);
    console.log('✅ Existing OpenZeppelin account connected.\n   at address =', OZaccount.address);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });