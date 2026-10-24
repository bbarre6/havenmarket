import path from "path";

process.env.DATABASE_URL = `file:${path.resolve(__dirname, "../test.db")}`;
