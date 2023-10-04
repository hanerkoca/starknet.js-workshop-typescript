// Test creation of Braavos account.
// use Starknet.js v5.19.5 (+ commit), starknet-devnet 0.6.2
// launch with npx ts-node src/scripts/braavos/4.signerAbstractionBraavos.ts

import { Provider, Account, Calldata, AbstractedSigner, BigNumberish, ec } from "starknet";
import { account3BraavosTestnetPrivateKey } from "../../A1priv/A1priv";
import { calculateAddressBraavos, abstractionFnsBraavos, proxyConstructorBraavos, BraavosProxyClassHash } from "./4a.abstractionBraavos";
import axios from "axios";


//          👇👇👇
// 🚨🚨🚨   Launch 'starknet-devnet --seed 0 --fork-network alpha-goerli' before using this script.
//          👆👆👆


async function main() {
    //initialize Provider 
    const provider = new Provider({ sequencer: { baseUrl: "http://127.0.0.1:5050" } });
    console.log('✅ Connected to devnet.');

    // initialize existing predeployed account 0 of Devnet
    const privateKey = "0xe3e70682c2094cac629f6fbed82c07cd";
    const accountAddress: string = "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a";
    const account0 = new Account(provider, accountAddress, privateKey);
    console.log('✅ Predeployed account connected\nOZ_ACCOUNT_ADDRESS=', account0.address);
    console.log('OZ_ACCOUNT_PRIVATE_KEY=', privateKey);

    // ********* deploy Braavos 
    const privateKeyBraavos = account3BraavosTestnetPrivateKey;
    const signerBraavos = new AbstractedSigner(privateKeyBraavos, abstractionFnsBraavos);
    const starkKeyPubBraavos = ec.starkCurve.getStarkKey(privateKeyBraavos);
    const proxyAddressBraavos = calculateAddressBraavos(privateKeyBraavos);
    const accountClassHashBraavos = "0x0105c0cf7aadb6605c9538199797920884694b5ce84fc68f92c832b0c9f57ad9"; // 27/aug/2023, will probably change over time
    const accountBraavos = new Account(provider, proxyAddressBraavos, signerBraavos);

    // fund account address before account creation       
    const { data: answer } = await axios.post('http://127.0.0.1:5050/mint', { "address": accountBraavos.address, "amount": 10_000_000_000_000_000_000, "lite": true }, { headers: { "Content-Type": "application/json" } });
    console.log('Answer mint =', answer); // 10 ETH

    // deploy Braavos account
    const proxyConstructor: Calldata = proxyConstructorBraavos(starkKeyPubBraavos);
    const signatureAddsDeployAccountBraavos: BigNumberish[] = [
        accountClassHashBraavos,
        0, 0, 0, 0, 0, 0, 0]; // if no hardware signer, put 7x zero.

    const estimatedFeeDeployBraavos = await accountBraavos.estimateAccountDeployFee({
        classHash: BraavosProxyClassHash,
        constructorCalldata: proxyConstructor,
        contractAddress: proxyAddressBraavos,
        addressSalt: starkKeyPubBraavos
    }, undefined,
        ...signatureAddsDeployAccountBraavos);
    console.log("Estimated fee =", estimatedFeeDeployBraavos.suggestedMaxFee);

    const { transaction_hash, contract_address } = await accountBraavos.deployAccount({
        classHash: BraavosProxyClassHash,
        constructorCalldata: proxyConstructor,
        contractAddress: proxyAddressBraavos,
        addressSalt: starkKeyPubBraavos
    }, undefined,

        ...signatureAddsDeployAccountBraavos
    );
    console.log("Braavos account deployed at :", contract_address);
    console.log('✅ Test completed.');
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
