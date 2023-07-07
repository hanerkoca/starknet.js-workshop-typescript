// Calculate private key from seed phrase.
// use Starknet.js v4.22.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/argentX/3.getPrivFromSeedStarkware-crypto.ts

import { ArgentXMnemonic } from "../../A-MainPriv/mainPriv";
import { encode,number ,ec} from "starknet";
// import { getKeyPairFromPath, grindKey } from "./keyDerivation";
// import { getStarkKey } from "./crypto";
import { KeyPair } from "starknet/dist/types/lib";
import * as bip32 from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { BigNumber, BigNumberish, utils } from "ethers"
import * as mStarknet from "micro-starknet";
import { isNumber } from "util";
import { hexToBytes } from '@noble/curves/abstract/utils';

function getStarkPairArgentX<T extends number | string>(
    indexOrPath: T,
    seed: Uint8Array,
    ): string {
    //const hex = encode.removeHexPrefix(number.toHex(seed))
    const masterNode = bip32.HDKey.fromMasterSeed(seed)
    // const path: string = isNumber(indexOrPath)
    //     ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
    //     : indexOrPath
    const path=indexOrPath as string;
    const childNode = masterNode.derive(path)

    if (!childNode.privateKey) {
        throw "childNode.privateKey is undefined"
    }

    const groundKey = mStarknet.grindKey(childNode.privateKey)

//     const starkKeyPair = ec.getKeyPair(groundKey);
// const starknetPublicKey = ec.getStarkKey(starkKeyPair);

    return groundKey;
}

async function main() {
    // with starkware-crypto (for v4)
    const mnemonic: string = ArgentXMnemonic;
    const seed = bip39.mnemonicToSeedSync(mnemonic)
    const pathBase = "m/44'/9004'/0'/0/";

    const resu=getStarkPairArgentX(pathBase+"0",seed);
    console.log("resu =",resu);

    // for (let i = 0; i < 20; i++) {
    //     const path = pathBase + String(i);
    //     console.log("path =", path);
    //     const keyPair = getKeyPairFromPath(mnemonic, path);
    //     const privKey = BigInt("0x" + keyPair.getPrivate().toString(16));
    //     const pubKey = "0x" + keyPair.getPublic("hex");
    //     const pubStarkKey = "0x" + getStarkKey(keyPair);
    //     console.log("privKey =", privKey);

    // }
    // process.exit(4);

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//    function getStarkPair<T extends number | string>(
//         indexOrPath: T,
//         seed: string,
//         ...[baseDerivationPath]: T extends string ? [] : [string]
//     ): KeyPair {
//         const hex = encode.removeHexPrefix(num.toHex(seed))
//         const masterNode = HDKey.fromMasterSeed(hexToBytes(encode.sanitizeBytes(hex)))
//         const path: string = isNumber(indexOrPath)
//             ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
//             : indexOrPath
//         const childNode = masterNode.derive(path)
    
//         if (!childNode.privateKey) {
//             throw "childNode.privateKey is undefined"
//         }
    
//         const groundKey = grindKey(childNode.privateKey)
    
//         return {
//             pubKey: encode.sanitizeHex(getStarkKey(groundKey)),
//             getPrivate: () => encode.sanitizeHex(groundKey),
//         }
//     }
    