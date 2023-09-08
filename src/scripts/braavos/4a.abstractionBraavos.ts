// module for Braavos account abstraction.
// Coded with Starknet.js v5.19.5 (+commit), starknet-devnet 0.6.2


import { Calldata, num, Signature, ec, hash, CallData, BigNumberish, DeployAccountSignerDetails, AbstractionFunctions } from "starknet";

export const BraavosInitialClassHash = "0x5aa23d5bb71ddaa783da7ea79d405315bafa7cf0387a74f4593578c3e9e6570";
export const BraavosProxyClassHash = "0x03131fa018d520a037686ce3efddeab8f28895662f019ca3ca18a626650f7d1e";

export function proxyConstructorBraavos(starkKeyPubBraavos: string): Calldata {
    const BraavosInitializer: Calldata = CallData.compile({ public_key: starkKeyPubBraavos });;
    return CallData.compile({
        implementation_address: BraavosInitialClassHash,
        initializer_selector: hash.getSelectorFromName("initializer"),
        calldata: [...BraavosInitializer]
    });
}

export function calculateAddressBraavos(privateKeyBraavos: BigNumberish): string {
    const starkKeyPubBraavos = ec.starkCurve.getStarkKey(num.toHex(privateKeyBraavos));

    const proxyConstructorCalldata = proxyConstructorBraavos(starkKeyPubBraavos);

    return hash.calculateContractAddressFromHash(
        starkKeyPubBraavos,
        BraavosProxyClassHash,
        proxyConstructorCalldata,
        0);

}

export function signDeployAccountBraavos(standardInputData: DeployAccountSignerDetails,
    privateKeyBraavos: string,
    ...additionalParams: string[]): Signature {
    if (additionalParams.length < 8) {
        throw new Error(`Braavos deploy account signer is waiting 8 additional parameters. Got: ${additionalParams.length} params!`);
    }
    const braavosAccountClassHash = additionalParams[0];
    const hardwareSigner = additionalParams.slice(1, 8);

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
    braavosAccountClassHash,
    ...hardwareSigner,
    ]);

    const { r, s } = ec.starkCurve.sign(
        txnHash,
        privateKeyBraavos,
    );
    const signature = [r.toString(), s.toString(), braavosAccountClassHash, ...hardwareSigner];
    return signature
}

export const abstractionFnsBraavos: AbstractionFunctions = {
    abstractedDeployAccountSign: signDeployAccountBraavos
}
