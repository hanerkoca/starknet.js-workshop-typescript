// Calculate private key from ArgentX seed phrase.
// Coded with Starknet.js v5.19.5, starknet-devnet 0.6.1
// launch with npx ts-node src/scripts/argentX/4.getPrivFromArgentXSeed.ts
import { CallData, ec, hash } from "starknet";
import * as mStarknet from '@scure/starknet';
import * as bip32 from "@scure/bip32";
import * as bip39 from '@scure/bip39';

const mnemonic = "inquiry tuition toe harvest vanish dress doctor maid divorce mystery cross loyal";
const contractAXclassHash = "0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003";

const masterSeed = bip39.mnemonicToSeedSync(mnemonic);
const hdKey1 = bip32.HDKey.fromMasterSeed(masterSeed).derive("m/44'/60'/0'/0/0");
const hdKey2 = bip32.HDKey.fromMasterSeed(hdKey1.privateKey!)
const pathBase = "m/44'/9004'/0'/0/";

for (let i = 0; i < 5; i++) {
    const path = pathBase + String(i);
    const hdKeyi = hdKey2.derive(path);
    console.log("path =", path);
    const starknetPrivateKey = "0x" + mStarknet.grindKey(hdKeyi.privateKey!);
    console.log("privateKey =", starknetPrivateKey);
    const starkKeyPubAX = ec.starkCurve.getStarkKey(starknetPrivateKey);
    const constructorAXCallData=CallData.compile([starkKeyPubAX,0]);
    const accountAXAddress = hash.calculateContractAddressFromHash(starkKeyPubAX, contractAXclassHash, constructorAXCallData, 0);
    console.log('Account address=', accountAXAddress);
}
