The Enum `Option` implements serialize/deserialize. So it can be used in Starknet contract function signatures.
Unfortunately, it's not implemented in `Result` Enum, that is at least as useful as `Option`.
This PR propose to implement serialize/deserialize in the Enum `Result`.
It has been made in accordance with @enitrat comment in Discord : https://discord.com/channels/793094838509764618/1065544063245365288/1124678948157141062
> Result::Ok((value))  would become [0,value] and Result::Err(value) would become [1,value]

So such code become possible in Cairo : 
```rust
fn test6(self: @ContractState, val1: u16) -> Result<u16, u16> {
    if val1 < 100 {
        return Result::Err(14);
    }
    Result::Ok(val1)
}

fn test8(self: @ContractState, inp: Result<Order, u16>) -> u16 {
    match inp {
        Result::Ok(x) => {
            return x.p2;
        },
        Result::Err(y) => {
            return y;
        }
    }
}
```
Several tests have been made with Starknet.js/Starknet-devnet, with success :
```typescript
const res10 = await myTestContract.call("test6", [90], { parseRequest: false, parseResponse: false });
// result is : [ '0x1', '0xe' ]
const res11 = await myTestContract.call("test6", [110], { parseRequest: false, parseResponse: false });
// result is : [ '0x0', '0x6e' ]
const res14 = await myTestContract.call("test8", [0,92,93], { parseRequest: false, parseResponse: false });
// result is : [ '0x5d' ]
const res15 = await myTestContract.call("test8", [1,112], { parseRequest: false, parseResponse: false });
// result is : [ '0x70' ]
```
Milan:

gm ser, congrats on the Cairo PR 🎉
if you don't mind a suggestion, in deserialize, it's IMO better to do a match on the variant - pop_front returns an Option, so if the variant is None, the whole deserialization should be None as well
even though to be honest, not sure under what circumstances it would return None 🙂
