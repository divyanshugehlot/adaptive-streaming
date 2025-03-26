"use client"

import axios from "axios";
import React, { ChangeEvent, useState } from "react";

const handleFileUpload =  async (event:ChangeEvent<HTMLInputElement>)=>{
    const file = event.target.files?.[0];
    if(!file){
        console.log(" No file selected");
        return;
    }
    console.log(file)
    try{
        const formData = new FormData();
        formData.append("video",file);
        const response = await axios.post(
            "http://localhost:3000/api/v1/videos/upload",
            formData,
            {
                headers:{
                    'Content-Type':'multipart/form-data'
                }
            }
            
        )
        console.log(response);


    }
    catch(error){
        console.log("something went wrong",error);
    }
}


const VideoUpload = () => {
    const [videoUrl,setVideoUrl] = useState<string|null>(null);
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8 ">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-blue-800 font-bold ">Upload video</h1>
        <input
          type="file"
          className="black w-full text-sm text-gray-700 border border-gray-300 p-2 mt-2 bg-gray-500 cursor-pointer mb-4 "
        onChange={(e)=>{handleFileUpload(e)}}
        />
      </div>
    </div>
  );
};

export default VideoUpload;
