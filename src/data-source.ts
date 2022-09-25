import "reflect-metadata";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "hello",
  password: "hello-pw",
  database: "hello",
  synchronize: false,
  logging: true,
  logger: "simple-console",
  entities: [],
  migrations: [],
  subscribers: [],
});
