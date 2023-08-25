// verify a message off-line
// Coded with Starknet.js v5.11.1
// Launch with  npx ts-node src/scripts/signature/2.signatureTestV5.ts





import { WeierstrassSignatureType, ec, encode, hash, num } from 'starknet'

const privKeyRandom = encode.buf2hex(ec.starkCurve.utils.randomPrivateKey());
const privateKey = '0x5b7d4f8710b3581ebb2b8b74efaa23d25ab0ffea2a4f3e269bf91bf9f63d633';
const fullPubKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))); // complete
const starknetPubKey = ec.starkCurve.getStarkKey(privateKey); // only X part
console.log('fullpubKey    =', fullPubKey);
console.log('starknetPubKey= ', starknetPubKey);

const message: num.BigNumberish[] = ['0x53463473467', '0x879678967', '0x67896789678'];

const msgHash = hash.computeHashOnElements(message);
const signature: WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey);



// on receiver side
const verifStarknet = ec.starkCurve.verify(signature, msgHash, fullPubKey);
console.log('verifStarknet =', verifStarknet);




