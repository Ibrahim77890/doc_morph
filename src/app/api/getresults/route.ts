import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(request: NextRequest) {
  try {
    const resultFilePath = path.join(process.cwd(), "public", "raw", "modified_raw_sentences.txt");
    const linksFilePath = path.join(process.cwd(), "public", "raw", "links.txt");

    // Read the contents of both files
    const resultFileContent = await fs.readFile(resultFilePath, "utf-8");
    const linksFileContent = await fs.readFile(linksFilePath, "utf-8");

    // Combine the contents into a single string
    const combinedContent = `${resultFileContent}\n\n${linksFileContent}`;


    // Send the combined content as a response
    return NextResponse.json({status: 200, message: combinedContent});
  } catch (error) {
    return new NextResponse("Error reading files", { status: 500 });
  }
}
