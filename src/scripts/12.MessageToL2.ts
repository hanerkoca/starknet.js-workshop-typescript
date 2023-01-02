// Connect a predeployed OZ account in devnet. 
// address and PrivKey are displayed when lanching starknet-devnet, and have been  stored in .env file.
// launch with npx ts-node src/scripts/1.connectPredeployedAccount.ts

import { Account, ec, hash, Provider, SequencerProvider } from "starknet";
import * as dotenv from "dotenv";
dotenv.config();

//    👇👇👇
// 🚨 launch 'starknet-devnet --seed 0' before using this script
//    👆👆👆
async function main() {
    // //initialize Provider with DEVNET, reading .env file
    // if (process.env.STARKNET_PROVIDER_BASE_URL != "http://127.0.0.1:5050") {
    //     console.log("This script work only on local devnet.");
    //     process.exit(1);
    // }
    const provider = new SequencerProvider({ baseUrl: "https://alpha4.starknet.io" });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT_PRIVATE_KEY ?? "";
    const starkKeyPair = ec.getKeyPair(privateKey);
    const accountAddress: string = process.env.OZ_ACCOUNT_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, starkKeyPair);
    console.log('✅ OZ predeployed account 0 connected.');

    const entryP = hash.getSelectorFromName("setPublicKey");
    console.log("entryP =", entryP);
    const responseEstimateMessageFee = await provider.estimateMessageFee({
        from_address: "0xc662c410C0ECf747543f5bA90660f6ABeBD9C8d",
        to_address: "0x102b9b464481570f8b3d4df8ea91ee468f8809183b9944ac5c5a2b5488d7595",
        entry_point_selector: "setPublicKey", // faut une function l1_handler
        payload: ["1234567890123456789"]
    })
    console.log("Estimated fee =", responseEstimateMessageFee);
    //console.log("Estimated fee =", responseEstimateMessageFee.overall_fee);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });