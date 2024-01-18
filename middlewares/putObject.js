const putObjectUrl = require("../utils/putObjectUrl");

const putSignedUrl= async(req,res,next)=>{
    try{
const fileName= `${req.query}-${Date.now()}/png`;
const contentType="image/png";
 return await putObjectUrl(fileName,contentType);
    }catch(err){
console.log(err)
    }
}
module.exports=putSignedUrl