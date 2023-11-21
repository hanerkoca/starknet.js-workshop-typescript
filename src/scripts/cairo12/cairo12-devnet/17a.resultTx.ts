// Enum like for tx response
// launch with : npx ts-node src/scripts/cairo12/cairo12-devnet/17.resultTx.ts
// Coded with Starknet.js v5.21.0

import { GetTransactionReceiptResponse, RejectedTransactionReceiptResponse, RevertedTransactionReceiptResponse, SuccessfulTransactionReceiptResponse, TransactionExecutionStatus } from "starknet";



interface Switchable {
    switch<E>(fts: {
        success: (resp: SuccessfulTransactionReceiptResponse) => E,
        rejected: (resp: RejectedTransactionReceiptResponse) => E,
        reverted: (resp: RevertedTransactionReceiptResponse) => E,
    }): E;
}

type StatusTx = {
    isSuccess: boolean,
    isRejected: boolean,
    isReverted: boolean,
}
export interface SuccessInterface extends StatusTx {
    status: "success",
    content: SuccessfulTransactionReceiptResponse,

}

export interface RejectedInterface extends StatusTx {
    status: "rejected",
    content: RejectedTransactionReceiptResponse,

}

export interface RevertedInterface extends StatusTx {
    status: "reverted",
    content: RevertedTransactionReceiptResponse,

}

export type TransactionResponseType = (SuccessInterface | RejectedInterface | RevertedInterface) & Switchable

export namespace TransactionResponse {

    class Success implements SuccessInterface {
        public status: "success" = "success"
        public content: SuccessfulTransactionReceiptResponse
        public readonly isSuccess = true;
        public readonly isRejected = false;
        public readonly isReverted = false;

        public constructor(val: GetTransactionReceiptResponse) {
            this.content = val as SuccessfulTransactionReceiptResponse
        }

    }

    // 2 other cases


    export function of(val: GetTransactionReceiptResponse): TransactionResponseType {
        switch (true) {
            case ("execution_status" in val) && val.execution_status === TransactionExecutionStatus.SUCCEEDED: {
                return new Success(val) ;
                break;
            }
            // 2 other cases
        }
        throw new Error("wrong data in transaction response.");
        // TODO : other cases and handle error (return in a specific variant for error (like rust None)).
    }

}


// **** test *******

const resp: GetTransactionReceiptResponse = {
    type: 'DECLARE',
    transaction_hash: '0x5ad959d524679cd3a3913e75fb90eefe83fbfbad7ac750a5b87f8cb6474d7ec',
    actual_fee: '0x1509a9f080800',
    messages_sent: [],
    events: [
        {
            from_address: '0x49d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
            keys: ['0x01'],
            data: ['0x02']
        }
    ],
    execution_status: 'SUCCEEDED',
    finality_status: 'ACCEPTED_ON_L2',
    block_hash: '0x2580c9b48f90a6a17f830aa4081ea9085382cf8a7f0d23787f003f4be53c566',
    block_number: 0
}

const responseTx = TransactionResponse.of(resp);
// const responseTx = TransactionResponse.of(await account.waitForTransaction(declareAccount.transaction_hash));

console.log("Response =", responseTx.content);
responseTx.switch({
    success(txR: SuccessfulTransactionReceiptResponse) { console.log("success =", txR) },
    rejected(txR: RejectedTransactionReceiptResponse) { console.log("rejected =", txR) },
    reverted(txR: RevertedTransactionReceiptResponse) { console.log("reverted =", txR) },
});
console.log("status = ", responseTx.status);
console.log("Is a success = ", responseTx.isSuccess);
console.log("Is rejected = ", responseTx.isRejected);
console.log("Is reverted = ", responseTx.isReverted);


