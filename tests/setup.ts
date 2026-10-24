import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });
config({ path: path.resolve(__dirname, "../.env") });

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.set("schema", "test");
process.env.DATABASE_URL = url.toString();
