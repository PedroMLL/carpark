#!/bin/bash
if [ ! -f "/src/keys/public.pem" ]; then
	openssl ecparam -genkey -name secp521r1 -noout -out /src/keys/private.pem
	# public key
	openssl ec -in /src/keys/private.pem -pubout -out /src/keys/public.pem
fi

/src/node_modules/.bin/knex  migrate:latest
node src/index