import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import mysql from "mysql2";
import type { DashboardState } from "./models";
import { createSeedData } from "./seed";

interface MysqlConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function getMysqlConfig(): MysqlConfig {
  return {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "campus_boardgame_rental",
  };
}

@Injectable()
export class DataStoreService implements OnModuleInit, OnModuleDestroy {
  private pool!: any;
  private state!: DashboardState;
  private initialized = false;

  async onModuleInit() {
    await this.ensureInitialized();
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async getState() {
    await this.ensureInitialized();
    return this.state;
  }

  async update(mutator: (state: DashboardState) => void | Promise<void>) {
    await this.ensureInitialized();
    await mutator(this.state);
    await this.writeToDatabase();
    return this.state;
  }

  private async ensureInitialized() {
    if (this.initialized) {
      return;
    }

    const config = getMysqlConfig();
    const bootstrapConnection = await mysql
      .createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      charset: "utf8mb4",
    })
      .promise();
    await this.ensureDatabase(bootstrapConnection, config.database);
    await bootstrapConnection.end();

    this.pool = mysql.createPool({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 10,
      charset: "utf8mb4",
      namedPlaceholders: true,
    }).promise();

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id TINYINT PRIMARY KEY,
        state_json LONGTEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

    const [rows] = await this.pool.query(
      "SELECT state_json FROM app_state WHERE id = 1 LIMIT 1",
    );

    if (!rows.length) {
      this.state = createSeedData();
      await this.pool.query(
        "INSERT INTO app_state (id, state_json) VALUES (1, ?)",
        [JSON.stringify(this.state)],
      );
    } else {
      this.state = JSON.parse(String(rows[0].state_json)) as DashboardState;
    }

    this.initialized = true;
  }

  private async ensureDatabase(connection: any, database: string) {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  }

  private async writeToDatabase() {
    await this.pool.query("UPDATE app_state SET state_json = ? WHERE id = 1", [
      JSON.stringify(this.state),
    ]);
  }
}
