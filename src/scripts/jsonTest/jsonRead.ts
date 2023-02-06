//
// launch with npx ts-node 
import fs from "fs";
export interface objERC20 {
    name: string,
    addressDevnet: string,
    AddressTestnet: string,
    AddressTestnet2: string,
    AddressMainnet: string,
}
const a: objERC20 = {
    name: "",
    addressDevnet: "",
    AddressTestnet: "T",
    AddressTestnet2: "",
    AddressMainnet: ""
};
type kofERC20 = keyof objERC20;
const key: kofERC20 = "AddressTestnet";
console.log(a[key]);
const ERC20addresses = JSON.parse(fs.readFileSync("./src/scripts/jsonTest/test.json").toString("ascii"));
console.log("ERC20addresses =", ERC20addresses);
console.log(ERC20addresses.erc20[0]);
console.log(ERC20addresses.erc20[0].name);
console.log(ERC20addresses.erc20[0]["AddressTestnet"]);
const myERC20: objERC20 = ERC20addresses.erc20.find((token: objERC20) => token.name = "ECU");
console.log("myERC20 =", myERC20);
const addressERC = myERC20[key];
console.log("address =", addressERC);
