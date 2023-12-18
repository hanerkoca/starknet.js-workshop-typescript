// Verify Ethereum signature. 
// Coded with Starknet.js v5.24.5 + experimental commit
// launch with npx ts-node src/scripts/signature/14.ethSigner.ts

import { Account, EthSigner, WeierstrassSignatureType, ec, encode, eth, num } from 'starknet';
import { secp256k1 } from '@noble/curves/secp256k1';
import { Wallet as EthersWallet, utils as EthersUtils } from "ethers";
import { SignatureType } from '@noble/curves/abstract/weierstrass';

async function main() {
    const myPrivateKey = eth.ethRandomPrivateKey();
    console.log("private key =", myPrivateKey);
    const MyEthersW = new EthersWallet(myPrivateKey);
    const EthersHashedMessage = EthersUtils.hashMessage("dura lex sed lex!");
    console.log("EthersHashedMessage =", EthersHashedMessage);
    const EthersSigned = await MyEthersW.signMessage("dura lex sed lex!");
    console.log("Ethers signature =", EthersSigned);

    const myEthSigner = new EthSigner(myPrivateKey);
    const EthSigned = await myEthSigner.signHash(encode.removeHexPrefix(encode.sanitizeHex(EthersHashedMessage))) as WeierstrassSignatureType;
    const { r, s, recovery } = EthSigned;
    const fEthSignature = encode.addHexPrefix(encode.removeHexPrefix(num.toHex(r)) + encode.removeHexPrefix(num.toHex(s))) + (recovery ? "1c" : "1b");
    console.log("Starknet.js ETH signature =", EthSigned);
    console.log("Starknet.js ETH signature =", fEthSignature);
    console.log("Signatures identical =", fEthSignature===EthersSigned);

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// private key = 0x525bc68475c0955fae83869beec0996114d4bb27b28b781ed2a20ef23121b8de
// EthersHashedMessage = 0xcdc3bdc9787ec5f58868fa233461d8d8c1047921fcc30df21a79ae0bbda2d94a
// Ethers signature = 0x2495a0796c39c241d5f8f03d3e1cc29d9fc73439bd5ca692cd4ece512e67723a498e7d6ebe01a9d4759ef9018deb409372aa32970569b7df911dfd5ad5ef122d1b
// pk= 525bc68475c0955fae83869beec0996114d4bb27b28b781ed2a20ef23121b8de
// Starknet.js ETH signature = Signature {
//   r: 16547630314616090561365776572148948641359160356910220461349795346493609570874n,
//   s: 33270595933674478832421600352490532633244111674664795606303715499029136609837n,
//   recovery: 0
// }
// Starknet.js ETH signature = 0x2495a0796c39c241d5f8f03d3e1cc29d9fc73439bd5ca692cd4ece512e67723a498e7d6ebe01a9d4759ef9018deb409372aa32970569b7df911dfd5ad5ef122d1b
// Signatures identical = true