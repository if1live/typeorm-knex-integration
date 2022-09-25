# typeorm-knex-integration
share mysql connection in typeorm and knex.
experimental. do not use in production.

1. initialize typeorm with connection pool
2. create [custom knex dialect][knex-dialect] to use typeorm's connection
3. typeorm and knex use same mysql connection
    * (checked by `select connection_id()` query)

## start
```bash
docker compose up -d
# or edit src/data-source.ts

pnpm install
pnpm start
```

```
PS D:\proj-misc\typeorm-knex-integration> pnpm start

> typeorm-knex-integration@1.0.0 start D:\proj-misc\typeorm-knex-integration
> ts-node-esm src/index.ts

query: SELECT VERSION() AS `version`
# simple
query: select connection_id()
simple_1_typeorm [ RowDataPacket { 'connection_id()': '108' } ]
simple_1_knex [ RowDataPacket { 'connection_id()': '108' } ]
query: select connection_id()
simple_2_typeorm [ RowDataPacket { 'connection_id()': '108' } ]
simple_2_knex [ RowDataPacket { 'connection_id()': '108' } ]

# transaction
query: START TRANSACTION
query: select connection_id()
transaction_1_typeorm [ RowDataPacket { 'connection_id()': '108' } ]
transaction_1_knex [ RowDataPacket { 'connection_id()': '108' } ]
query: COMMIT
query: START TRANSACTION
query: select connection_id()
transaction_2_typeorm [ RowDataPacket { 'connection_id()': '108' } ]
transaction_2_knex [ RowDataPacket { 'connection_id()': '108' } ]
query: COMMIT

# concurrency
query: START TRANSACTION
query: select connection_id()
concurrency_0_typeorm [ RowDataPacket { 'connection_id()': '108' } ]
query: START TRANSACTION
query: START TRANSACTION
query: START TRANSACTION
query: START TRANSACTION
concurrency_0_knex [ RowDataPacket { 'connection_id()': '108' } ]
query: COMMIT
query: select connection_id()
query: select connection_id()
query: select connection_id()
query: select connection_id()
concurrency_4_typeorm [ RowDataPacket { 'connection_id()': '112' } ]
concurrency_1_typeorm [ RowDataPacket { 'connection_id()': '109' } ]
concurrency_2_typeorm [ RowDataPacket { 'connection_id()': '110' } ]
concurrency_3_typeorm [ RowDataPacket { 'connection_id()': '111' } ]
concurrency_4_knex [ RowDataPacket { 'connection_id()': '112' } ]
query: COMMIT
concurrency_1_knex [ RowDataPacket { 'connection_id()': '109' } ]
query: COMMIT
concurrency_2_knex [ RowDataPacket { 'connection_id()': '110' } ]
query: COMMIT
concurrency_3_knex [ RowDataPacket { 'connection_id()': '111' } ]
query: COMMIT
```

[knex-dialect]: https://github.com/knex/knex/blob/master/CONTRIBUTING.md#i-would-like-to-add-support-for-new-dialect-to-knex-is-it-possible
