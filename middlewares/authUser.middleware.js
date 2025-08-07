import jwt from 'jsonwebtoken';

// User authentication middleware

const authUser = async (req,res,next) => {
    try {
       const {atoken} = req.headers;
           console.log("🔐 authUser received token:", atoken); // Add this
       if (!atoken) {
        return res.json({success:false , message:"Not Authorized login again"})
       } 
       const token_decode = jwt.verify(atoken,process.env.JWT_SECRET)
      req.userId = token_decode.id

       next();
    } catch (error) {
        console.log(error);
        res.json({success:false , message:error.message})
    }
}
export default authUser;