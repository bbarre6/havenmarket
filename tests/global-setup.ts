import { config } from "dotenv";
import { execSync } from "child_process";
import { Client } from "pg";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });
config({ path: path.resolve(__dirname, "../.env") });

const TEST_SCHEMA = "test";

function testDatabaseUrl() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.set("schema", TEST_SCHEMA);
  return url.toString();
}

async function dropTestSchema() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    await client.query(`DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE`);
  } finally {
    await client.end();
  }
}

export async function setup() {
  await dropTestSchema();

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: testDatabaseUrl() },
    stdio: "inherit",
  });
}

export async function teardown() {
  await dropTestSchema();
}
