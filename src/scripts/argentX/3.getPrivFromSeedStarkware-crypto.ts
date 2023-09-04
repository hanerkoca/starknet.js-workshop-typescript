// Calculate private key from seed phrase.
// use Starknet.js v4.22.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/argentX/3.getPrivFromSeedStarkware-crypto.ts

import { ArgentXMnemonic } from "../../A-MainPriv/mainPriv";

import { getKeyPairFromPath, grindKey } from "./inputs/keyDerivation";
import { getStarkKey } from "./inputs/crypto";

async function main() {
    // with starkware-crypto (for v4)
    const mnemonic: string = ArgentXMnemonic;
    const pathBase = "m/44'/9004'/0'/0/";

    for (let i = 0; i < 20; i++) {
        const path = pathBase + String(i);
        console.log("path =", path);
        const keyPair = getKeyPairFromPath(mnemonic, path);
        const privKey = BigInt("0x" + keyPair.getPrivate().toString(16));
        const pubKey = "0x" + keyPair.getPublic("hex");
        const pubStarkKey = "0x" + getStarkKey(keyPair);
        console.log("privKey =", privKey);

    }
    // process.exit(4);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });