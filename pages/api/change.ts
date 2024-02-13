import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "locales",
    "en",
    "navbar.json"
  );

  // Your JSON data
  const jsonData = { name: "John Doe" };

  // Convert JSON data to string
  const jsonString = JSON.stringify(jsonData, null, 2); // The third parameter is for indentation (optional)

  // Write the JSON string to the file
  fs.writeFileSync(filePath, jsonString);

  res.status(200).json({ message: "JSON file created successfully" });
}
