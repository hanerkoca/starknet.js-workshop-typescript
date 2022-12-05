
#curl -X POST http://127.0.0.1:5050/restart -H "Content-Type:application/json"

curl -X POST http://127.0.0.1:5050/mint -d '{"address":"0x1234","amount":50000000000000000000,"lite":true}' -H "Content-Type:application/json"
