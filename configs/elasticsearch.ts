import { Client } from "@elastic/elasticsearch";
import type { Client as NewClient } from "@elastic/elasticsearch/api/new";

//@ts-expect-error
const esClient: NewClient = new Client({
  node: ["https://3.126.77.186:9200"],
  auth: {
    username: "elastic",
    password: "7QmyMISFnHUfFYpDf9e0",
  },
  ssl: {
    rejectUnauthorized: false,
  },
});
export default esClient;
