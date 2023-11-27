// test in testnet/rpc0.5.0 a contract.
// launch with npx ts-node src/scripts/cairo12/cairo12-testnet/7.tmp.testWeth.ts
// Coded with Starknet.js v5.23.0

import { RpcProvider, Account, Contract, cairo }  from "starknet";
import { account2TestnetAddress, account2TestnetPrivateKey } from "../../../A1priv/A1priv";

async function main() {
    const provider = new RpcProvider({ nodeUrl: "https://starknet-testnet.public.blastapi.io/rpc/v0.5" });
    console.log("Provider connected.");
    const privateKey = process.env.privateKey;
    const accountAddress = account2TestnetAddress;

    const account = new Account(provider, accountAddress, account2TestnetPrivateKey);


    // approve

    const weth = "0x076a6937ed2933fc68dea7c2b5ce132a3dd08510debb4fbfe4cc846149179727";
    const compiledWeth = await provider.getClassAt(weth);
    const wethC = new Contract(compiledWeth.abi, weth, provider);
    console.log(wethC.functions);
    const contractAddress = "0x076a6937ed2933fc68dea7c2b5ce132a3dd08510debb4fbfe4cc846149179727";
    const compiledSierra = await provider.getClassAt(contractAddress);
    const myTestContract = new Contract(compiledSierra.abi, contractAddress, provider);
    wethC.connect(account)

    // Approve tokens to account address
    const amountToMint = cairo.uint256(1000000000000);
    console.log("Invoke Tx - Minting 1000 tokens to account0...");
    const approveParams = {
        spender: myTestContract.address,
        amount: amountToMint
    };
    const myCall = wethC.populate("approve", approveParams);
    console.log("Calldata =", myCall.calldata);

    const resp = await account.execute(myCall);
    console.log("resp", resp)
    const txR = await provider.waitForTransaction( resp.transaction_hash);
    console.log(txR);
    console.log('✅ Test completed.');

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
