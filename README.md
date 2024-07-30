# DocMorph

DocMorph is a simple web-based document transformer application designed to process PDF documents with defined styles. This tool extracts images, text, and embedded hyperlinks from PDF files and organizes the content into a clean, structured format. The application stores extracted images on Cloudinary and integrates their links at the corresponding positions in the document. Additionally, all hyperlinks are collected and placed at the end of the document, ensuring a well-organized output. The main advantage of this application is that any person having trouble in make embeddings for some document can easily place his desired text inside the pdf which will later be parsed and simplified for making embeddings for his AI chat bots and much more.

## Features

- **Text Extraction**: Extracts text from PDF documents and structures it into sentences.
- **Image Extraction**: Extracts images from PDFs and stores them on Cloudinary, with links integrated into the document.
- **Hyperlink Extraction**: Extracts embedded hyperlinks and appends them to the end of the document.
- **Structured Output**: Provides a text-based file that includes all extracted data in a user-friendly format.

## Technologies Used

- **Frontend**: [Next.js](https://nextjs.org/) - A React framework for server-rendered applications.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework for styling.
- **Image Storage**: [Cloudinary](https://cloudinary.com/) - A cloud-based image and video management platform.

## Tech Stack

- **Next.js**: For building the web interface and handling server-side logic.
- **Tailwind CSS**: For styling and responsive design.
- **Cloudinary**: For storing and managing images extracted from PDF files.

## How It Works

1. **Upload PDF**: Users upload a PDF document with specific styles.
2. **Processing**: The application processes the document, extracting text, images, and hyperlinks.
3. **Output Generation**: Text is divided into sentences using nlp transformers, images are uploaded to Cloudinary with their links embedded in the text, and hyperlinks are appended to the end of the document.
4. **Download**: Users can download the transformed document in a clean, structured format.


## ScreenShots
![dm1](https://github.com/user-attachments/assets/a335ea01-192e-402f-ae3d-82833c243de0)
![dm2](https://github.com/user-attachments/assets/d57622cd-f110-4bce-96de-dbeed6d50dbb)
![dm3](https://github.com/user-attachments/assets/cb0f7774-28b1-4e38-9883-ea3608f3e10f)
![dm4](https://github.com/user-attachments/assets/2f28bd46-ddee-4900-a05c-d90bbff6d57b)

