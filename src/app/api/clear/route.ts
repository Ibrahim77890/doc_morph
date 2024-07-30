import { NextRequest, NextResponse } from "next/server";
import fs from 'fs'
import path from "path";

export async function GET(request: NextRequest) {
    try {
        const imagesDirectory = path.join(process.cwd(), 'public', 'images')
        const textFilesDirectory = path.join(process.cwd(), 'public', 'raw')
        const pdfsDirectory = path.join(process.cwd(), 'public', 'files')

        const pdfs = fs.readdirSync(pdfsDirectory);
        await Promise.all(pdfs.map(file => fs.rm(path.join(pdfsDirectory, file), (err)=>{
            if(err) console.error("Error removing pdf files")
        })));

        const textFiles = await fs.readdirSync(textFilesDirectory);
        await Promise.all(
        textFiles.map(file => fs.writeFile(path.join(textFilesDirectory, file), '', (err)=>{
            if(err) console.error("Error removing data from text files")
        }))
        );

        const images = fs.readdirSync(imagesDirectory);
        await Promise.all(images.map(file => fs.rm(path.join(imagesDirectory, file), (err)=>{
            if(err) console.error("Error removing images files")
        })));
    
        return NextResponse.json({ status: 200, success: true })
    } catch (error) {
        console.error("Error at POST api/clear method: ", error)
        return NextResponse.json({ status: 500, message: "Internal Server Error at POST api/clear method" });
    }
}