
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x00d8161053A6958FF1f7fBE3BCaDfE8CeFB7f9796b20e97a8137b21173F8DcFC","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
