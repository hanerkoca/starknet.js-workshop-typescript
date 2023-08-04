//Cairo 2.1.0 

use array::ArrayTrait;

#[starknet::interface]
trait ITestContract<TContractState> {
    fn increase_counter(ref self: TContractState, amount: u128);
    fn decrease_counter(ref self: TContractState, amount: u128);
    fn get_counter(self: @TContractState) -> u128;
    fn test1(self: @TContractState, val1: u16) -> Order;
    fn test2(self: @TContractState, val1: u16) -> MyEnum;
    fn test2a(self: @TContractState, customEnum:MyEnum ) -> u16;
    fn test3(self: @TContractState, val1: u8) -> Option<u8>;
    fn test4(self: @TContractState, val1: u16) -> Option<Order>;
    fn test4b(self: @TContractState, val1: u32) -> OrderW;
    fn test4c(self: @TContractState, val1: u32) -> (MyEnum, Option<u8>);
    // fn test4d(self: @TContractState) -> Array<Option<u8>>;
    fn test5(self: @TContractState, inp: Option<Order>) -> u16;
    fn test6(self: @TContractState, val1: u8) -> Result<u8, felt252>;
    fn test7(self: @TContractState, val1: u16) -> Result<Order, u16>;
    fn test8(self: @TContractState, inp: Result<Order, u16>) -> u16;
    fn test9(self: @TContractState, val1: u16, amount: u256) -> u256;
}


//simple struct
#[derive(Copy, Drop, Serde)]
struct Order {
    p1: felt252,
    p2: u16,
}

#[derive(Drop, Serde, Append)]
enum MyEnum {
    Response: Order,
    Warning: felt252,
    Error: (u16,u16),
    Critical: Array<u32>,
    Empty:()
}

// struct with enum
#[derive(Drop, Serde)]
struct OrderW {
    p1: felt252,
    my_enum: MyEnum,
    adds: Option<u8>,
}

#[starknet::contract]
mod MyTestContract {
    use starknet::ContractAddress;
    use starknet::contract_address_const;
use array::ArrayTrait;
use array::SpanTrait;

    use super::{Order, MyEnum, OrderW};

    #[storage]
    struct Storage {
        counter: u128, 
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        CounterIncreased: CounterIncreased,
        CounterDecreased: CounterDecreased
    }

    #[derive(Drop, starknet::Event)]
    struct CounterIncreased {
        #[key]
        from: ContractAddress,
        amount: u128
    }

    #[derive(Drop, starknet::Event)]
    struct CounterDecreased {
        amount: u128
    }

    #[l1_handler]
    fn increase_bal(ref self: ContractState, from_address: felt252, amount: u128) {
        let current = self.counter.read();
        self.counter.write(current + amount);
    }


    #[constructor]
    fn constructor(ref self: ContractState, intial_value: u128) {
        self.counter.write(intial_value);
    }

    #[external(v0)]
    impl CounterContract of super::ITestContract<ContractState> {
        fn get_counter(self: @ContractState) -> u128 {
            self.counter.read()
        }

        fn increase_counter(ref self: ContractState, amount: u128) {
            let current = self.counter.read();
            self.counter.write(current + amount);
            self
                .emit(
                    CounterIncreased {
                        from: contract_address_const::<0x6c8fe36d7454901424063b5c1b949d7e347ce3872d2487b30b76f3a4fd7c219>(),
                        amount: amount
                    }
                );
        }

        fn decrease_counter(ref self: ContractState, amount: u128) {
            let current = self.counter.read();
            self.counter.write(current - amount);
            self.emit(CounterDecreased { amount });
        }


        fn test1(self: @ContractState, val1: u16) -> Order {
            Order { p1: 10, p2: val1 }
        }

        // return MyEnum
        fn test2(self: @ContractState, val1: u16) -> MyEnum {
            if val1 < 100 {
                return MyEnum::Error((3,4));
            }
            if val1 == 100 {
                return MyEnum::Warning('attention:100');
            }
            if val1 < 150 {
                let mut arr=ArrayTrait::new();
                arr.append(5);
                arr.append(6);
                return MyEnum::Critical(arr);
            }
            if val1<200 {
                return MyEnum::Empty(());
            }
            MyEnum::Response(Order { p1: 1, p2: val1 })
        }

        // MyEnum as input
        fn test2a(self: @ContractState, customEnum:MyEnum ) -> u16{
            match customEnum{
                MyEnum::Response(my_order)=>{return my_order.p2;},
                MyEnum::Warning(val)=>{return 0x13_u16;},
                MyEnum::Error((a,b))=>{return b;},
                MyEnum::Critical(myArray)=>{return 0x3c_u16;},
                MyEnum::Empty(_)=>{return 0xab_u16;}
            }
        }

        // return Option<litteral>
        fn test3(self: @ContractState, val1: u8) -> Option<u8> {
            if val1 < 100 {
                return Option::None(());
            }
            Option::Some(val1 + 1)
        }
        // return Option<Order>
        fn test4(self: @ContractState, val1: u16) -> Option<Order> {
            if val1 < 100 {
                return Option::None(());
            }
            Option::Some(Order { p1: 18, p2: val1 })
        }
        // return struct including enum
        fn test4b(self: @ContractState, val1: u32) -> OrderW {
            if val1 < 100 {
                return OrderW {
                    p1: 1, 
                    my_enum: MyEnum::Response(Order { p1: 1, p2: 2 }), 
                    adds: Option::None(())
                };
            }
            if val1 > 200 {
                return OrderW {
                    p1: 3, my_enum: MyEnum::Warning('attention:200'), adds: Option::Some(17)
                };
            }
            OrderW { p1: 2, my_enum: MyEnum::Error((255,254)), adds: Option::Some(0x10) }
        }

        // return tuple including Option enum
        fn test4c(self: @ContractState, val1: u32) -> (MyEnum, Option<u8>) {
            if val1 < 100 {
                return (MyEnum::Response(Order { p1: 1, p2: 2 }), Option::None(()));
            };

            (MyEnum::Error((200,201)), Option::Some(0x10))
        }


        // // return array including enum. Do not work in v2.0.0
        // fn test4d(self: @ContractState) -> Array<Option<u8>> {
        //     let mut arr:Array<Option<u8>> = ArrayTrait::new();
        //     let enum1 = Option::Some(0x80);
        //     let enum2 = Option::None(());
        //     arr.append(enum1);
        //     arr.append(enum2);
        //     arr
        // }

        // use as input Option<Order>
        fn test5(self: @ContractState, inp: Option<Order>) -> u16 {
            match inp {
                Option::Some(x) => {
                    return x.p2;
                },
                Option::None(()) => {
                    return 17;
                }
            }
        }
        // return Result<litteral> . Do not work in v2.0.0
        fn test6(self: @ContractState, val1: u8) -> Result<u8, felt252> {
            if val1 >127 {
                return Result::Err('Too high. 127 maxi.');
            }
            Result::Ok(val1 * 2)
        }
        // return Result<Order>
        fn test7(self: @ContractState, val1: u16) -> Result<Order, u16> {
            if val1 < 100 {
                return Result::Err(14);
            }
            Result::Ok(Order { p2: val1, p1: 8 })
        }
        // use as input Result<Order>
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
        fn test9(self: @ContractState, val1: u16, amount: u256) -> u256 {
            amount + 1
        }
    }
}
