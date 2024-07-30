"use client"

import { FormEvent, SetStateAction, useEffect, useState } from "react";


export default function Home() {
  const [file, setFile] = useState<File>()
  const [data, setData] = useState<string>("")
  const [shouldFetch, setShouldFetch] = useState(false);

  const fetchData = async () => {
    try {
      const response = await fetch("api/getresults", {method: 'GET'});
      const data = await response.json();
      console.log("Response of data obtained:",data.message);
      setData(removeBack(data.message))
      // Handle the fetched data
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  function removeBack(text:string) {
    return text.replace(/\\(?!n).{3}/g, '');
  }

  const handleResults = () => {
    fetchData()
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setShouldFetch(true);
      const formData = new FormData()
      if (!file) return
      formData.append("file", file)

      const response = await fetch("api/backend", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        alert("File not sent")
        return;
      }

      alert("File sent successfully")
    } catch (error) {
      alert(`Error in File Submission: ${error}`)
    }
  }

    const downloadFile = () => {
      if(!data) return;
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'file.txt'; // The name of the file to be downloaded
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url); // Clean up the URL.createObjectURL
    };

  const handleClick = async () => {
    try {
      console.log("Clicked");
      const response = await fetch('api/clear', {method: 'GET'})

      if (response.ok) {
        alert('Files and images cleared successfully!');
      } else {
        alert('Failed to clear files and images.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while clearing files and images.');
    }
  };



  return (
    <div className="min-h-screen w-screen p-4 flex flex-col gap-4 bg-[#4183F2]">
      {/* Navigation Bar */}
      <div className="h-24 flex items-center p-3 w-full bg-opacity-20 justify-between bg-[#213f73]">
        <p className="text_styles font-medium">DocMorph</p>
        <div className="flex flex-row gap-4">
          <button onClick={(e)=>handleClick()} className="border-2 border-white shadow-lg p-2 hover:scale-105 hover:shadow-2xl transition-transform duration-1000">Clear files data</button>
          <button onClick={(e)=>downloadFile()} className="border-2 border-white shadow-lg p-2 hover:scale-105 hover:shadow-2xl transition-transform duration-1000">Download text file</button>
        </div>
      </div>

      {/* Introduction Area */}
      <div className="h-fit w-full flex flex-row justify-evenly">
        <div className="w-full h-fit p-8 flex justify-center bg-blue-100 bg-opacity-20">
          <p className=" h-full text-blue-800 font-bold text-2xl w-full leading-loose">
          Welcome to DocMorph, the ultimate AI-powered tool for converting raw documents into structured, meaningful headings. Our cutting-edge technology simplifies the process of organizing your text and photos, leveraging advanced artificial intelligence to extract and generate key headings with remarkable accuracy.</p>
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="h-full w-full flex justify-center items-center flex-col gap-4 pt-8">
          <input type="file" onChange={(e) => setFile(e?.target?.files?.[0])} className="border-2 border-black p-3"/>
          <button type="submit" className="border-2 border-[#213f73] shadow-lg p-2 hover:scale-105 hover:shadow-2xl transition-transform duration-[1/2s]">Upload</button>
        </form>

      </div>

      {/* Document result Preview */}
      <div className="w-full h-fit flex p-4 flex-col border-2 border-[#213f73]">
        <p>Document Data Preview:</p>
      </div>
      <div className="w-full h-fit flex flex-row p-4 gap-4 border-2 border-[#213f73]">
        <button onClick={(e)=>handleResults()} className="border-2 border-white shadow-lg p-2 hover:scale-105 hover:shadow-2xl transition-transform duration-1000">Get Results</button>
        <div className="overflow-auto h-52">
          <p className="text-[#213f73]">{data || "Nothing to show here"}</p>
        </div>
      </div>
    </div>
  );
}
