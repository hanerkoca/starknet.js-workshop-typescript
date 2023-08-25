// verify a message off-line
// Coded with Starknet.js v5.17.0
// Launch with  npx ts-node src/scripts/cairo12-katana/3.calculateSign.ts


import { WeierstrassSignatureType, ec, encode, hash, num } from 'starknet'

// const privateKey = "0x300001800000000300000180000000000030000000000003006001800006600";
const privateKey = "079c733b28fb8555cdffc3984d521df11c234ae7c7106ab56bdc175595511a64";
    const accountAddress: string = "0x3ee9e18edc71a6df30ac3aca2e0b02a198fbce19b7480a63a0d71cbd76652e0";
    const pubK="0x1b7b37a580d91bc3ad4f9933ed61f3a395e0e51c9dd5553323b8ca3942bb44e";
const fullPubKey = encode.addHexPrefix(encode.buf2hex(ec.starkCurve.getPublicKey(privateKey, false))); // complete
const starknetPubKey = ec.starkCurve.getStarkKey(privateKey); // only X part
console.log('fullpubKey    =', fullPubKey);
console.log('starknetPubKey= ', starknetPubKey);

//const message: num.BigNumberish[] = ['0x53463473467', '0x879678967', '0x67896789678'];

//const msgHash = hash.computeHashOnElements(message);
const msgHash="0x35ba2ab5d05cd48e760438341e9b6f2d05dbc7d1842104b91724d993b3e61a1";
const signature:WeierstrassSignatureType = ec.starkCurve.sign(msgHash, privateKey);
console.log("signature =",signature);


// on receiver side
const verifStarknet = ec.starkCurve.verify(signature, msgHash, fullPubKey);
console.log('verifStarknet =', verifStarknet);