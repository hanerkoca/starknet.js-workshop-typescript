use core::option::OptionTrait;
use core::traits::{Into, TryInto};
use array::ArrayTrait;

#[starknet::interface]
trait ITestContract<TContractState> {
    fn get_counter(self: @TContractState) -> u128;
    fn get_addr_counter(self: @TContractState) -> (felt252, felt252);
    fn addr_stor_base_offset(self: @TContractState, base: felt252, offset: u8) -> felt252;
    fn addr_stor_felt(self: @TContractState, felt: felt252) -> felt252;
}


#[derive(Copy, Drop, Serde, storage_access::StorageAccess)]
struct Order {
    p1: felt252,
    p2: u16,
}

// #[derive(Copy, Drop, Serde, storage_access::StorageAccess)]
// struct Order2 {
//     p1: felt252,
//     p2: Array<u16>,
// }


#[starknet::contract]
mod MyTestContract {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
    use starknet::StorageAddress;
    use starknet::storage_access::{
        StorageAccess, StorageBaseAddress, Felt252TryIntoStorageAddress, storage_base_address_const,
        storage_base_address_from_felt252, storage_address_from_base,
        storage_address_from_base_and_offset, storage_address_to_felt252,
        storage_address_try_from_felt252
    };
    use core::option::OptionTrait;
    use core::traits::{Into, TryInto};
    use array::ArrayTrait;
    use super::{Order,  // Order2
    };

    #[storage]
    struct Storage {
        counter: u128,
        amount: u256,
        my_order: Order,
        // my_order2: Order2,
        //table: Array<u16>,
        balances: LegacyMap::<ContractAddress, u256>,
    }

    #[constructor]
    fn constructor(
        ref self: ContractState,
        counter0: u128,
        amount0: u256,
        my_order0: Order,
        //my_order20: Order2,
        addr: ContractAddress,
    //table0: Array<u16>,
    ) {
        self.counter.write(counter0);
        self.amount.write(amount0);
        self.my_order.write(my_order0);
        // self.my_order2.write(my_order20);
        //self.table.write(table0);
        self.balances.write(addr, amount0);
    }

    #[external(v0)]
    impl CounterContract of super::ITestContract<ContractState> {
        fn get_counter(self: @ContractState) -> u128 {
            self.counter.read()
        }

        fn get_addr_counter(self: @ContractState) -> (felt252, felt252) {
            let base: StorageBaseAddress = self.counter.address();
            let addr_offset0: StorageAddress = storage_address_from_base_and_offset(base, 0);
            let base252: felt252 = storage_address_to_felt252(addr_offset0);
            let addr: StorageAddress = storage_address_from_base(base);
            let addr252: felt252 = storage_address_to_felt252(addr);
            (base252, addr252)
        }

        fn addr_stor_base_offset(self: @ContractState, base: felt252, offset: u8) -> felt252 {
            let addr_base: StorageBaseAddress = storage_base_address_from_felt252(base);
            let addr: StorageAddress = starknet::storage_address_from_base_and_offset(
                addr_base, offset
            );
            storage_address_to_felt252(addr)
        }

        fn addr_stor_felt(self: @ContractState, felt: felt252) -> felt252 {
            let a: StorageAddress = storage_address_try_from_felt252(felt).unwrap();
            let c: felt252 = storage_address_to_felt252(a);
            c
        }
    }
}
