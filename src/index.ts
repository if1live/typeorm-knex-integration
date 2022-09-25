import { DataSource, EntityManager } from "typeorm";
import { Knex } from "knex";
import { AppDataSource } from "./data-source.js";
import { knexInitialize } from "./MyKnex.js";

await AppDataSource.initialize();

async function execute_typeorm(
  manager: DataSource | EntityManager,
  title: string
) {
  const result = await manager.query(`select connection_id()`);
  console.log(`${title}_typeorm`, result);
}

async function execute_knex(knex: Knex, title: string) {
  const result = await knex.select(knex.raw("connection_id()"));
  console.log(`${title}_knex`, result);
}

async function scenario_simple(title: string) {
  const connection = AppDataSource.manager.connection;
  const knex = knexInitialize(connection);

  await execute_typeorm(connection, title);
  await execute_knex(knex, title);

  await knex.destroy();
}

async function scenario_transaction(title: string) {
  await AppDataSource.manager.transaction(async (manager) => {
    const knex = knexInitialize(manager);

    await execute_typeorm(manager, title);
    await execute_knex(knex, title);

    await knex.destroy();
  });
}

console.log('# simple');
await scenario_simple("simple_1");
await scenario_simple("simple_2");
console.log('');

console.log('# transaction');
await scenario_transaction("transaction_1");
await scenario_transaction("transaction_2");
console.log('');

console.log('# concurrency');
await Promise.all(
  Array.from({ length: 5 }).map((x, idx) =>
    scenario_transaction(`concurrency_${idx}`)
  )
);
console.log('');

process.exit();
