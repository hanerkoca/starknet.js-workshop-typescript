// Calculate private key from seed phrase.
// use Starknet.js v5.16.0, starknet-devnet 0.5.5
// launch with npx ts-node src/scripts/argentX/2.getPrivFromSeed-Ethers.ts
import { BigNumber, BigNumberish, utils, Wallet } from "ethers" //v5.5.0
import { ec, encode, } from "starknet"
import * as mStark from 'micro-starknet';
import { bytesToHex } from '@noble/curves/abstract/utils';
import { ArgentXMnemonic } from "../../A-MainPriv/mainPriv";
import * as bip32 from '@scure/bip32';
import * as bip39 from '@scure/bip39';

async function main() {
    // with ethers & micro-starknet
    const mnemonic: string = ArgentXMnemonic;
    const seed: Uint8Array = bip39.mnemonicToSeedSync(mnemonic);
    const secret = encode.buf2hex(seed);
    console.log("secret =",secret);
    const masterNode = utils.HDNode.fromSeed(seed);
    console.log("masterNode",masterNode);
    const pathBase = "m/44'/9004'/0'/0/";
    for (let i = 0; i < 10; i++) {
        const path = pathBase + String(i);
        console.log("path =", path);
        const childNode = masterNode.derivePath(path)
        console.log("privK =",childNode.privateKey);
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