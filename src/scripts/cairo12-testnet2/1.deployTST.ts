// deploy TST ERC20 in tesnet2.
// launch with npx ts-node src/scripts/cairo12-devnet/8.deployRejected.ts
// Coded with Starknet.js v5.19.2

import { constants, Provider, Contract, Account, json, RpcProvider, CallData, Calldata, cairo, Uint256 } from "starknet";
import fs from "fs";
import { accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey, TonyNode } from "../../A2priv/A2priv";



async function main() {
    // initialize node Testnet2 
    const provider = new RpcProvider({ nodeUrl: TonyNode });

    // Check that communication with provider is OK
    const bl = await provider.getBlock('latest');
    console.log("Block =", bl.block_number);

    const account = new Account(provider, accountTestnet2ArgentX1Address, accountTestnet2ArgentX1privateKey); // Cairo 0 account    

    const compiledErc20mintable = json.parse(fs.readFileSync("compiledContracts/cairo060/ERC20MintableOZ_0_6_1.json").toString("ascii"));

    // define the constructor :
    const initialTk: Uint256 = cairo.uint256(100_000);
    const erc20CallData: CallData = new CallData(compiledErc20mintable.abi);
    const ERC20ConstructorCallData: Calldata = erc20CallData.compile("constructor", {
        name: "TEST token",
        symbol: "TST",
        decimals: 2,
        initial_supply: initialTk,
        recipient: account.address,
        owner: account.address
    });

    console.log("constructor=", ERC20ConstructorCallData);
    const deployERC20Response = await account.declareAndDeploy({
        contract: compiledErc20mintable,
        constructorCalldata: ERC20ConstructorCallData
    });
    console.log("TST ERC20 declared hash: ", deployERC20Response.declare.class_hash);
    console.log("TST ERC20 deployed at address: ", deployERC20Response.deploy.contract_address);

    // TST ERC20 declared hash:  0x74953440d81a1b2deb04905bec239d8879f98bad63350ec550a07a7ff13dbc0
    // TST ERC20 deployed at address:  0x1e8294b01f549d27e135dbe54d30704ee4d3a6c6f9007e14e78010fc77e6c1d

    // Get the erc20 contract address
    const erc20Address = deployERC20Response.deploy.contract_address;
    // Create a new erc20 contract object
    const contractTST = new Contract(compiledErc20mintable.abi, erc20Address, provider);
    contractTST.connect(account);

    console.log("✅ Test completed.");

}
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });