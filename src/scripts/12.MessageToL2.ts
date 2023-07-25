// Connect a predeployed OZ account in devnet. 
// address and PrivKey are displayed when lanching starknet-devnet, and have been  stored in .env file.
// launch with npx ts-node src/scripts/12.MessageToL2.ts
// Coded with Starknet.js v5.16.0

import { Account, ec, hash, Provider, SequencerProvider,constants } from "starknet";
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
    const provider = new SequencerProvider({ baseUrl: constants.BaseUrl.SN_GOERLI });

    console.log('STARKNET_PROVIDER_BASE_URL=', process.env.STARKNET_PROVIDER_BASE_URL);

    // initialize existing predeployed account 0 of Devnet
    console.log('OZ_ACCOUNT_ADDRESS=', process.env.OZ_ACCOUNT0_DEVNET_ADDRESS);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY);
    const privateKey = process.env.OZ_ACCOUNT0_DEVNET_PRIVATE_KEY ?? "";
    const accountAddress: string = process.env.OZ_ACCOUNT0_DEVNET_ADDRESS ?? "";
    const account = new Account(provider, accountAddress, privateKey);
    console.log('✅ OZ predeployed account 0 connected.');

    const entryP = hash.getSelectorFromName("setPublicKey");
    console.log("entryP =", entryP);
    const responseEstimateMessageFee = await provider.estimateMessageFee({
        from_address: "0xc662c410C0ECf747543f5bA90660f6ABeBD9C8d", // L1 addr
        to_address: "0x033de869eb1905fe503610527c51e245119bd05c231e7165c95d6fb630fe05ff", // L2 addr (PhilTest2.cairo)
        entry_point_selector: "increase_bal", // needs to be a Cairo function with decorator @l1_handler, and first parameter named 'from_address'.
        payload: ["0x2b34"] // do not list here 'from_address' parameter.
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