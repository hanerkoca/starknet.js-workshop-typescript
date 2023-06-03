import { hash, ec } from "starknet";

// From Braavos team :

// yes, we customized the deploy account a bit so we can use hardware signer at account creation while still maintaining account recoverability.
// Basically the way it works is as follows:

//     1. DEPLOY_ACCOUNT always sends the following implementation in the CTOR: 0x5aa23d5bb71ddaa783da7ea79d405315bafa7cf0387a74f4593578c3e9e6570 and a public key derived from the mnemonic
//     2. The signature field is composed as follows:
//     3. first two elements at 0, 1 are (r, s) - the signature on hash = hash("regular" deploy account txn hash, ...rest of signature elements below)
//     4. on index 2 you put the latest Braavos impl hash - now it is: 0x2c2b8f559e1221468140ad7b2352b1a5be32660d0bf1a3ae3a054a4ec5254e4
//     5. on indices 3-9 you put your hardware signer - usually it will be just be 0, 0, 0, 0, 0, 0, 0



// here's a snippet out of our code that returns the signature you should use in the txn:

const txnHash = hash.calculateDeployAccountTransactionHash(
    contractAddress,
    classHash,
    ctorCalldata,
    starkPub,
    1,
    max_fee,
    chainId,
    0
);

const [r, s] = ec.sign(
    keys as KeyPair,
    hash.computeHashOnElements([
        txnHash,
        implementation_address,
        ...parsedOtherSigner,
    ])
);

return [r, s, implementation_address, ...parsedOtherSigner.map(e => e.toString())];