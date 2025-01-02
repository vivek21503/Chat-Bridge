require("dotenv").config()  
const express=require("express");
const app=express();
const mongoose=require("mongoose");
mongoose.connect('mongodb://127.0.0.1:27017/chatdb');
const userRoute=require('./routes/userRoute')

const http=require('http').Server(app);
const io = require('socket.io')(http);
var usp=io.of('user-namespace');
const user=require('./models/userModel')
const chat=require('./models/chatModel');
// connection this is an event
// The socket object contains various properties and methods that allow you to interact with that particular client.
usp.on('connection',async function(socket){
    console.log("connected");
   // console.log(socket.handshake.auth.token);
    var userId=socket.handshake.auth.token;
    await user.findByIdAndUpdate({_id:userId},{$set:{isOnline:'1'}});
    socket.broadcast.emit('user-status', { userId: userId, status: 'online' });
    
    socket.on('disconnect',async function(){
        await user.findByIdAndUpdate({_id:userId},{$set:{isOnline:'0'}});
        socket.broadcast.emit('user-status', { userId: userId, status: 'offline' });
        console.log("disconnected");
        
    });
    socket.on('newChat',function(data){
        socket.broadcast.emit('loadNewChat',data);
    });
    // load old chats
    socket.on('oldChat',async function(data){
        var chats=await chat.find({$or:[{senderId:data.sender_id,receiverId:data.receiver_id},{senderId:data.receiver_id,receiverId:data.sender_id}]});
        socket.emit('loadChat',{chats:chats});
        
    });
    // delete chat
    socket.on('chatdeleted',function(id){
        socket.broadcast.emit('chatMessageDeleted',id);
    })
});
app.use('/',userRoute);
http.listen(3000,()=>{
    console.log("server is running");
})

