// Calculate private key from seed phrase.
// use Starknet.js v4.22.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/argentX/3.getPrivFromSeedStarkware-crypto.ts

import { ArgentXMnemonic } from "../../A-MainPriv/mainPriv";
import { encode,number ,ec} from "starknet";
// import { getKeyPairFromPath, grindKey } from "./keyDerivation";
// import { getStarkKey } from "./crypto";
import { KeyPair } from "starknet/dist/types/lib";
import * as bip32 from '@scure/bip32';
import * as mStarknet from "micro-starknet";
import { isNumber } from "util";
import { hexToBytes } from '@noble/curves/abstract/utils';
import { BigNumber, BigNumberish, utils } from "ethers"


// function getStarkPairArgentX<T extends number | string>(
//     indexOrPath: T,
//     seed: string,
//     ): KeyPair {
//     const hex = encode.removeHexPrefix(number.toHex(seed))
//     const masterNode = bip32.HDKey.fromMasterSeed(hexToBytes(encode.sanitizeBytes(hex)))
//     // const path: string = isNumber(indexOrPath)
//     //     ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
//     //     : indexOrPath
//     const path=indexOrPath as string;
//     const childNode = masterNode.derive(path)

//     if (!childNode.privateKey) {
//         throw "childNode.privateKey is undefined"
//     }

//     const groundKey = mStarknet.grindKey(childNode.privateKey)

//     const starkKeyPair = ec.getKeyPair(groundKey);
// const starknetPublicKey = ec.getStarkKey(starkKeyPair);

//     return {
//         pubKey: encode.sanitizeHex(getStarkKey(groundKey)),
//         getPrivate: () => encode.sanitizeHex(groundKey),
//     }
// }

// inspired/copied from https://github.com/authereum/starkware-monorepo/blob/51c5df19e7f98399a2f7e63d564210d761d138d1/packages/starkware-crypto/src/keyDerivation.ts#L85
export function grindKey(keySeed: string): string {
    const keyValueLimit = ec.ec.n
    if (!keyValueLimit) {
      return keySeed
    }
    const sha256EcMaxDigest = number.toBN(
      "1 00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000",
      16,
    )
    const maxAllowedVal = sha256EcMaxDigest.sub(
      sha256EcMaxDigest.mod(keyValueLimit),
    )
  
    // Make sure the produced key is devided by the Stark EC order,
    // and falls within the range [0, maxAllowedVal).
    let i = 0
    let key
    do {
      key = hashKeyWithIndex(keySeed, i)
      i++
    } while (!key.lt(maxAllowedVal))
  
    return "0x" + key.umod(keyValueLimit).toString("hex")
  }

  function hashKeyWithIndex(key: string, index: number) {
    const payload = utils.concat([utils.arrayify(key), utils.arrayify(index)])
    const hash = utils.sha256(payload)
    return number.toBN(hash)
  }
  

async function main() {
    // with starkware-crypto (for v4)
    const mnemonic: string = ArgentXMnemonic;
    const pathBase = "m/44'/9004'/0'/0/";
    const grinded=grindKey("0x5dece8a5363c485cb1e6aab6bb6c33a529ab26c01f8ee501cf1cf2215eeab79b");
    console.log("grinded =",grinded);
    //const resu=getStarkPairArgentX(pathBase+"0",mnemonic);
    //console.log("resu =",resu);

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
    