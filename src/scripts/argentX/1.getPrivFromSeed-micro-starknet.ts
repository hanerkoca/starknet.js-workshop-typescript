// Calculate private key from seed phrase.
// use Starknet.js v5.16.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/argentX/1.getPrivFromSeed-micro-starknet.ts
// import { BigNumber, BigNumberish, utils, Wallet } from "ethers"
import * as mStark from 'micro-starknet';
import { ArgentXMnemonic } from "../../A-MainPriv/mainPriv";
import * as bip32 from '@scure/bip32';
import * as bip39 from '@scure/bip39';

async function main() {
    // with micro-starknet (100% Starknet.js libs)
    const mnemonic: string = ArgentXMnemonic;
    const seed: Uint8Array = bip39.mnemonicToSeedSync(mnemonic);// +password?
    const masterNode = bip32.HDKey.fromMasterSeed(seed);
    const pathBase = "m/44'/9004'/0'/0/";
    for (let i = 0; i < 10; i++) {
        const path = pathBase + String(i);
        console.log("path =", path);
        const childNode = masterNode.derive(path);
        if (!childNode.privateKey){throw new Error("No privKey")};
        const groundKey = "0x" + mStark.grindKey(childNode.privateKey)
        console.log("groundKey =", groundKey, "\n", BigInt(groundKey));
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

    // export function getStarkPair<T extends number | string>(
    //     indexOrPath: T,
    //     seed: string,
    //     ...[baseDerivationPath]: T extends string ? [] : [string]
    //   ): KeyPair {
    //     const hex = encode.removeHexPrefix(num.toHex(seed))
    //     const masterNode = HDKey.fromMasterSeed(hexToBytes(encode.sanitizeBytes(hex)))
    //     const path: string = isNumber(indexOrPath)
    //       ? getPathForIndex(indexOrPath, baseDerivationPath ?? "")
    //       : indexOrPath
    //     const childNode = masterNode.derive(path)
      
    //     if (!childNode.privateKey) {
    //       throw "childNode.privateKey is undefined"
    //     }
      
    //     const groundKey = grindKey(childNode.privateKey)
      
    //     return {
    //       pubKey: encode.sanitizeHex(getStarkKey(groundKey)),
    //       getPrivate: () => encode.sanitizeHex(groundKey),
    //     }
    //   }