# carpark

local

1. ```bash
mkdir keys
	openssl ecparam -genkey -name secp521r1 -noout -out keys/private.pem
	# public key
	openssl ec -in keys/private.pem -pubout -out keys/public.pem
```

2. `npm i`
3. `node_modules/.bin/knex  migrate:latest`

Default user : admin/admin