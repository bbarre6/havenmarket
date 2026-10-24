import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import path from "path";

const TEST_DB_PATH = path.resolve(__dirname, "../test.db");

export async function setup() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = TEST_DB_PATH + suffix;
    if (existsSync(file)) unlinkSync(file);
  }

  execSync("npx prisma migrate deploy", {
    cwd: path.resolve(__dirname, ".."),
    env: { ...process.env, DATABASE_URL: `file:${TEST_DB_PATH}` },
    stdio: "inherit",
  });
}

export async function teardown() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = TEST_DB_PATH + suffix;
    if (existsSync(file)) unlinkSync(file);
  }
}
