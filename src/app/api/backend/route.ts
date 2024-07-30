import { writeFile } from "fs/promises";
import { PDFDocument, PDFPage, PDFRef, PDFObject, PDFArray } from 'pdf-lib';
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import fs from 'fs'
import path from "path";
import { SentenceTokenizer } from "natural";
import { spawn } from "child_process";
import { v2 as cloudinary } from 'cloudinary'
import OpenAI from "openai";
import PDFParser from "pdf2json";

const api_key = process.env.OPENAI_API_KEY!;
const openai = new OpenAI({
    apiKey: api_key,
})

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!
})



export async function POST(request: NextRequest) {
    try {
        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if(!file) return NextResponse.json({status: 404, success: false})

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const pathJ = join("public/files", file.name)
        await writeFile(pathJ, buffer)
        console.log("File uploaded Successfully")

        // Parse its contents, firstly text(normal plus tables) then images
        // Taking consideration that file should mostly be a pdf document

        const directoryPath = join(process.cwd(), 'public', 'files');
        const files = fs.readdirSync(directoryPath);
        const pathP = join(directoryPath, files[0])
        // console.log("path", pathP)


        // Function to install requirements
        const installRequirements = () => {
            return new Promise<void>((resolve, reject) => {
                const pipInstall = spawn('pip', ['install', '-r', `${process.cwd()}/public/python_files/requirements.txt`]);

                pipInstall.stdout.on('data', (data) => {
                    console.log(`pip stdout: ${data}`);
                });

                pipInstall.stderr.on('data', (data) => {
                    console.error(`pip stderr: ${data}`);
                });

                pipInstall.on('close', (code) => {
                    if (code !== 0) {
                        reject(`pip install process exited with code ${code}`);
                    } else {
                        resolve();
                    }
                });
            });
        };

        // Function to execute the Python script
        const executePythonScript = () => {
            const pythonProcess = spawn('python', [`${process.cwd()}/public/python_files/script.py`]);

            const outputFilePath = 'public/raw/raw.txt';
            const fileStream = fs.createWriteStream(outputFilePath);

            pythonProcess.stdout.on('data', (data) => {
                console.log(`Output from Python script: ${data.toString()}`);
                const output = data.toString();
                fileStream.write(output)
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error(`Error: ${data.toString()}`);
            });

            pythonProcess.on('close', (code) => {
                console.log(`Python script exited with code ${code}`);
            });
        };

        // Run the installation and then the script
        installRequirements()
            .then(executePythonScript)
            .then(async()=>{
                // Provide appropriate data to APIs and get required results
        await ImageProcessing()
        let imageURLs:string[] = []

        const rawImagesPath = path.join(process.cwd(), "public", "raw", "imageLinks.txt")
        console.log("RAWIMAGESPATH:", rawImagesPath)
        fs.readFile(rawImagesPath, 'utf-8', (err, data)=> {
            if(err){
                console.error("Error reading file:", err);
            }
            console.log("DATA from images file:", data)
            imageURLs = data.split('_@_');
            console.log("IMAGEURLS:", imageURLs)
        })


        // Store image paths in raw.txt
        const rawFilePath = path.join(process.cwd(), "public", "raw", 'raw.txt');
        fs.readFile(rawFilePath, 'utf-8', (err, data)=> {
            if(err){
                console.error("Error reading file:", err);
            }

            let fileContent = data;
            let imageIndex = 0;
            console.log("IMAGEURLS:", imageURLs)
            const updatedContent = fileContent.replace(/\[\I\M\A\G\E\]/g,()=>{
                if(imageIndex < imageURLs.length){
                    return imageURLs[imageIndex++]
                }else{
                    return '[IMAGE]'
                }
            })


            const outputFilePath = path.join(process.cwd(), "public", "raw", 'modified_raw.txt');
            fs.writeFile(outputFilePath, updatedContent, 'utf-8', (err) => {
                if (err) {
                    console.error("Error writing modified text file:", err);
                } else {
                    console.log("File has been updated successfully.");
                }
            });
            TextProcessing()
        })
            })
            .catch((error) => {
                console.error(`Error during setup: ${error}`);
        });

        return NextResponse.json({ status: 200, success: true })
    } catch (error) {
        console.error("Error at POST api/backend method: ", error)
        return NextResponse.json({ status: 500, message: "Internal Server Error at POST api/backend method" });
    }
}


const TextProcessing = () => {
    try {
        const rawModPath = path.join(process.cwd(), "public", "raw", "modified_raw.txt")
        const rawModModPath = path.join(process.cwd(), "public", "raw", "modified_raw_sentences.txt")
        console.log("RAWIMAGESPATH:", rawModModPath)
        let sentences:string[] = []
        let sentencesList:string = ""
        fs.readFile(rawModPath, 'utf-8', (err, data)=> {
            if(err){
                console.error("Error reading file:", err);
            }
            const sentenceTokenizer = new SentenceTokenizer()
            sentences = sentenceTokenizer.tokenize(data.replace(/\\n/g, "")
            .replace(/\\xef/g, "")
            .replace(/\\x82/g, "")
            .replace(/\\xb7/g, "")
            .replace(/\\xc6/g, "t")
            .replace(/\\xa9/g, "t")
            .replace(/\\x9f/g, "i")
            .replace(/\\x81/g, "i")
            .replace(/\\xc5\\x8c/g, "l")
            .replace(/\\xe2\\x80\\x99/g, "'")
            .replace(/\\xac/g,"f"))
            sentencesList = sentences.map(item=>{
                return  item
        }).join("\n")
            fs.writeFile(rawModModPath, sentencesList, (err) => {
                if (err) {
                    console.error("Error writing modified text file:", err);
                } else {
                    console.log("File has been updated successfully.");
                }
            })
        })


    } catch (error) {
        console.error("Error in TextProcessing method", error)
    }
}

const ImageProcessing=async():Promise<void> =>{
    try {
        //Loading and Encoding Image to base64 url
        const imagesDirectory = path.join(process.cwd(), "public", "images")
        const files = fs.readdirSync(imagesDirectory);
        const base64Urls = files.map(file => {
            const filePath = path.join(imagesDirectory, file);
            const imageData = fs.readFileSync(filePath);
            const base64Image = Buffer.from(imageData).toString('base64');
            const mimeType = path.extname(file).substring(1);
            return `data:image/${mimeType};base64,${base64Image}`;
        });


        const outputDirFile = path.join(process.cwd(), "public", "raw", "imageLinks.txt")
        let fileStream = fs.createWriteStream(outputDirFile);
        let upload_urls:string[] = []
        await Promise.all(base64Urls.map(async base64Url => {
            const upload_url = (await cloudinary.uploader.upload(base64Url, { upload_preset: 'mangoAPI' })).url
            console.log("\nSingleURL:", upload_url);
            
            upload_urls.push(upload_url)
        })).then(()=>{
            console.log("Uploading URLs: ", outputDirFile ,upload_urls)
            fileStream.write(upload_urls.map(item=>item).join("_@_"))
        })


    } catch (error) {
        console.error(`Error in ImageProcessing method: ${error}`)
    }
}
