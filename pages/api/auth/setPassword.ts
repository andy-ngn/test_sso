import type { NextApiHandler } from "next";
import bcrypt from "bcryptjs";
import esClient from "@/configs/elasticsearch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/configs/next-auth";

const handler: NextApiHandler = async (req, res) => {
  const { password, userId } = req.body;
  if (!password || !userId) {
    res.status(400).json({ error: "Params missing" });
    return;
  }
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.userId || session.user.userId !== userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ error: "Letters and numbers" });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await esClient.update({
      index: "test_sso_users",
      id: userId,
      body: {
        doc: {
          password: hashedPassword,
        },
      },
    });
    return res.status(200).json({ message: "Password updated" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export default handler;
