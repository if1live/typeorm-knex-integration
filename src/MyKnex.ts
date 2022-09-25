import { DataSource, EntityManager, QueryRunner } from "typeorm";
import { Knex, default as knexInit } from "knex";
import { nanoid } from "nanoid";

const MysqlDialect = (await import(`knex/lib/dialects/mysql/index.js`)).default;

function isEntityManager(x: DataSource | EntityManager): x is EntityManager {
  const ty = x["@instanceof"].toString();
  return ty === "Symbol(EntityManager)";
}

function isDataSource(x: DataSource | EntityManager): x is DataSource {
  const ty = x["@instanceof"].toString();
  return ty === "Symbol(DataSource)";
}

// 커넥션 목록
MysqlDialect.prototype.table = {};

MysqlDialect.prototype.acquireRawConnection = async function () {
  const connectionId = this.connectionSettings.database;
  const connection: DataSource | EntityManager = this.table[connectionId];

  if (isEntityManager(connection)) {
    const queryRunner = connection.queryRunner;
    const inner = await queryRunner.connect();
    inner.queryRunner = queryRunner;
    return inner;
  } else if (isDataSource(connection)) {
    const queryRunner = connection.createQueryRunner();
    const inner = await queryRunner.connect();
    inner.queryRunner = queryRunner;
    return inner;
  } else {
    throw new Error("unknown connection");
  }
};

MysqlDialect.prototype.destroyRawConnection = async function (inner) {
  const connectionId = this.connectionSettings.database;
  const connection: DataSource | EntityManager = this.table[connectionId];

  if (isDataSource(connection)) {
    const queryRunner = inner.queryRunner as QueryRunner;
    await queryRunner.release();
  } else if (isEntityManager(connection)) {
    // skip
  }

  delete this.table[connectionId];
  return;
};

MysqlDialect.prototype.validateConnection = async () => {
  return true;
};

export function knexInitialize(conn: DataSource | EntityManager): Knex {
  const connectionId = nanoid();
  MysqlDialect.prototype.table[connectionId] = conn;

  const knex = (knexInit as any)({
    client: MysqlDialect,
    // debug: true,
    // 존재하지 않는 주소로 연결. 실제 커넥션 발생하지 않는거 확인
    connection: {
      host: "127.0.0.1",
      port: 3306,
      user: "invalid",
      password: "invalid",
      database: connectionId,
    },
    // 풀 자체를 정의하지 않으면 knex 초기화에서 실패한다
    pool: { min: 0, max: 1 },
  });
  return knex;
}
