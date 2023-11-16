// test a multicall in tesnet2.
// launch with npx ts-node src/scripts/cairo12-devnet/8.deployRejected.ts
// Coded with Starknet.js v5.19.2

import { constants, Provider, Contract, Account, json, RpcProvider, CallData, Calldata, cairo, Uint256 } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode, accountTestnet2Braavos1Address, accountTestnet2Braavos3Address } from "../../../A2priv/A2priv";



async function main() {
    // initialize node Testnet2 
    const provider = new RpcProvider({ nodeUrl: TonyNode });;

    // Check that communication with provider is OK
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);

    const account = new Account(provider, accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey); // Cairo 0 account    



    // Get the erc20 contract address
    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/cairo060/ERC20MintableOZ_0_6_1.json").toString("ascii"));
    const addressTST = "0x1e8294b01f549d27e135dbe54d30704ee4d3a6c6f9007e14e78010fc77e6c1d";
    const contractTST = new Contract(compiledErc20mintable.abi, addressTST, provider);
    contractTST.connect(account);

    const transaction1 = contractTST.populate("mint", {
        to: accountTestnet2Braavos1Address,
        amount: cairo.uint256(100)
    });
    const transaction2 = contractTST.populate("mint", {
        to: accountTestnet2Braavos3Address,
        amount: cairo.uint256(200)
    });
    const th = await account.execute([transaction1, transaction2]);
    await provider.waitForTransaction(th.transaction_hash);
    console.log("Minted x2.");

    const bal1 = await contractTST.balanceOf(accountTestnet2Braavos1Address);
    const bal3 = await contractTST.balanceOf(accountTestnet2Braavos3Address);
    console.log("bal1 =", bal1, "\nbal3 =", bal3);

    console.log("✅ Test completed.");
}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });