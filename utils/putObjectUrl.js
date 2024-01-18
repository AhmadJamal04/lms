const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const dotenv= require("dotenv-safe");
dotenv.config({path:".env"})

const s3Client= new S3Client({
    region:"ap-south-1",
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY,
        
    }
});
const getObjectURL = async (key) => {
    const command = new GetObjectCommand({
      Bucket:process.env.AWS_STORAGE_BUCKET_NAME,
      Key: key,
    });
const url =await getSignedUrl(s3Client,command)
return url;    
}
const putObjectUrl= async function(fileName,contentType){
    const command= new PutObjectCommand({
        Bucket: process.env.AWS_STORAGE_BUCKET_NAME,
        Key:`uploads/user-uploads/${fileName}`,
        ContentType:contentType,
        
    });
    const url= await getSignedUrl(s3Client,command)
    return url
}
const uploadFile= async(fileName,fileStream,contentType)=>{
    
    const params= {
        Bucket:process.env.AWS_STORAGE_BUCKET_NAME,
        Key:fileName,
        Body:fileStream,
        ContentType:contentType,
      
        
    }
    try {
      const detail=  await s3Client.send(new PutObjectCommand(params))
      console.log(detail)
        return "content uploaded to s3 bucket successfully";
    } catch (error) {
        return false
    }
}
module.exports={putObjectUrl,uploadFile,getObjectURL};