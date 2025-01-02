const user=require("../models/userModel");
const chat=require("../models/chatModel");
const bcrypt=require("bcrypt");
const registeratonLoad=async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log("error")
    }
}
const register=async(req,res)=>{
    // const { name, email, image, password, isOnline } = req.body;
    try {
        // It means the password will be hashed 2¹⁰ (1024) times, 
        const passwordHash=await bcrypt.hash(req.body.password,10);
        const User=new user({
            name:req.body.name,
            email:req.body.email,
            image:'images/'+req.file.filename,
            password:passwordHash,
            isOnline:req.body.isOnline
        });
        await User.save();
        res.render('register',{message:"Registration Successful"})
    } catch (error) {
        console.log("error occuried",error)
    }
}

const loadlogin=async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error)
    }
}
const login=async (req,res)=>{
    try {
        const {email,password}=req.body;
        const userData= await user.findOne({email:email})
        if(userData){
            const passMatch= await bcrypt.compare(password,userData.password);
            if(passMatch){
                req.session.user=userData;
                res.redirect('/dashBoard');

            }
            else{
                res.render('login',{message:'Email or Password is Wrong!'});
            }
        }
        else{
            res.render('login',{message:'Email or Password is Wrong!'});
        }
        
    } catch (error) {
        console.log(error.message)
    }


}
const logout=async (req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/')
    } catch (error) {
        console.log(error.message);
    }
}
const loadDashboard=async (req,res)=>{
    try {
        var users=await user.find({_id:{$nin:[req.session.user._id]}}); 
        res.render('dashboard',{user:req.session.user,users:users});
    } catch (error) {
        console.log(error.message);
    }
}
const saveChat=async(req,res)=>{
    try {
        const Chat=new chat({
            senderId:req.body.sender_id,
            receiverId:req.body.receiver_id,
            message:req.body.message
        });
        var  newChat= await Chat.save();
        res.status(200).send({success:true,message:"chat inserted",data:newChat});

        
    } catch (error) {
        res.status(400).send({success:false,message:error.message});
    }
}
const deleteChat=async (req,res)=>{
    try {
        await chat.deleteOne({_id:req.body.id});
        res.status(200).send({success:true});
    } catch (error) {
        res.status(400).send({success:false,message:error.message});
    }
}
module.exports={
    registeratonLoad,
    register,
    loadlogin,
    login,
    logout,
    loadDashboard,
    saveChat,
    deleteChat,
}