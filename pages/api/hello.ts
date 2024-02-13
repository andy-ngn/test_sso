import esClient from "@/configs/elasticsearch";
import type { NextApiRequest, NextApiResponse } from "next";

type IndexName = "accounts" | "sessions" | "users";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const entry: IndexName = "accounts";
  // await clearIndex(entry);
  const { body } = await esClient.search<any>({
    index: `test_sso_` + entry,
  });
  res.status(200).json(body);
}

const clearIndex = async (index: IndexName) => {
  await esClient.deleteByQuery({
    index: "test_sso_" + index,
    refresh: true,
    body: {
      query: {
        match_all: {},
      },
    },
  });
};
