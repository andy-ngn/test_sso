import esClient from "@/configs/elasticsearch";
import type { NextApiRequest, NextApiResponse } from "next";

type IndexName = "_accounts" | "_sessions" | "_users";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const entry: IndexName = "_sessions";
  const { body } = await esClient.search({
    index: "test_sso" + entry,
  });
  res.status(200).json(body);
}
