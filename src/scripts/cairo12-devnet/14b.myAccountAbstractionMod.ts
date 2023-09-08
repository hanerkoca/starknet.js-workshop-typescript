// module for account abstraction test.
// Coded with Starknet.js v5.19.5 (+commit), starknet-devnet 0.6.2


import { Calldata, num, Signature, ec, hash, CallData, BigNumberish, DeployAccountSignerDetails, AbstractionFunctions, RawCalldata, DeclareSignerDetails, TypedData, typedData } from "starknet";
import { StarknetChainId } from "starknet/src/constants";



export function signDeployAccount(standardInputData: DeployAccountSignerDetails,
    privateKey: string,
    ...additionalParams: string[]
): Signature {
    if (additionalParams.length < 3) {
        throw new Error(`Abstracted deploy account signer is waiting 3 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const signer2FA = additionalParams;

    const txnHash = hash.computeHashOnElements([hash.calculateDeployAccountTransactionHash(
        standardInputData.contractAddress,
        standardInputData.classHash,
        CallData.compile(standardInputData.constructorCalldata),
        standardInputData.addressSalt,
        standardInputData.version,
        standardInputData.maxFee,
        standardInputData.chainId,
        standardInputData.nonce
    ),
    ...signer2FA // the smart contract will check that the 2FA is 0x01, 0x02, 0x03
    ]);

    const { r, s } = ec.starkCurve.sign(
        txnHash,
        privateKey,
    );
    const signature = [r.toString(), s.toString(), ...signer2FA];
    return signature
}

export function signTransaction(
    standardInputData: {
        contractAddress: BigNumberish;
        version: BigNumberish;
        calldata: RawCalldata;
        maxFee: BigNumberish;
        chainId: StarknetChainId;
        nonce: BigNumberish;
    },
    privateKey: string,
    ...additionalParams: string[]
): Signature {
    if (additionalParams.length < 3) {
        throw new Error(`Abstracted transaction signer is waiting 3 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const signer2FA = additionalParams;

    const txnHash = hash.computeHashOnElements([hash.calculateTransactionHash(
        standardInputData.contractAddress,
        standardInputData.version,
        standardInputData.calldata,
        standardInputData.maxFee,
        standardInputData.chainId,
        standardInputData.nonce
    ),
    ...signer2FA // the smart contract will check that the 2FA is 0x04, 0x05, 0x06
    ]);

    const { r, s } = ec.starkCurve.sign(
        txnHash,
        privateKey,
    );
    const signature = [r.toString(), s.toString(), ...signer2FA];
    return signature
}

export function signDeclare(
    standardInputData: DeclareSignerDetails,
    privateKey: string,
    ...additionalParams: string[]
): Signature {
    if (additionalParams.length < 3) {
        throw new Error(`Abstracted declare signer is waiting 3 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const signer2FA = additionalParams;

    const txnHash = hash.computeHashOnElements([hash.calculateDeclareTransactionHash(
        standardInputData.classHash,
        standardInputData.senderAddress,
        standardInputData.version,
        standardInputData.maxFee,
        standardInputData.chainId,
        standardInputData.nonce,
        standardInputData.compiledClassHash
    ),
    ...signer2FA // the smart contract will check that the 2FA is 0x07, 0x08, 0x09
    ]);

    const { r, s } = ec.starkCurve.sign(
        txnHash,
        privateKey,
    );
    const signature = [r.toString(), s.toString(), ...signer2FA];
    return signature
}

export function hashMessage(
    eip712json: TypedData,
    accountAddress: string,
    ...additionalParams: string[]
): string {
    if (additionalParams.length < 3) {
        throw new Error(`Abstracted message hasher is waiting 3 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const signer2FA = additionalParams;
    const msgHash = hash.computeHashOnElements([
        typedData.getMessageHash(eip712json, accountAddress),
        ...signer2FA // the smart contract will check that the 2FA is 0x0a, 0x0b, 0x0c
    ]);
    return msgHash;
}

export function signMessage(
    msgHash: string,
    privateKey: string,
    ...additionalParams: string[]
): Signature {
    if (additionalParams.length < 3) {
        throw new Error(`Abstracted message signer is waiting 3 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const signer2FA = additionalParams;
    const { r, s } = ec.starkCurve.sign(
        msgHash,
        privateKey,
    );
    const signature = [r.toString(), s.toString(), ...signer2FA]; // the smart contract will check that the 2FA is 0x0a, 0x0b, 0x0c
    return signature;
}
export type AbstractionMessageFunctionHash = (
    typedData: TypedData,
    accountAddress: string,
    ...additionalParams: string[]
) => string;

export type AbstractionMessageFunctionSign = (
    msgHash: string,
    privateKey: string,
    ...additionalParams: string[]
) => Signature;

export const abstractionFns: AbstractionFunctions = {
    abstractedDeployAccountSign: signDeployAccount,
    abstractedTransactionSign: signTransaction,
    abstractedDeclareSign: signDeclare,
    abstractedMessageHash: hashMessage,
    abstractedMessageSign: signMessage
}


