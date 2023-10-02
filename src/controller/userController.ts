const User = require('./../model/UserModel')
import express from "express";
const jwt = require('jsonwebtoken');
const sharp = require('sharp')
const dotenv = require('dotenv');
const Track = require("./../model/trackModel")
const TvShow = require("./../model/tvShowModel")
const multer = require('multer')
const AppError = require('./../ErrorHandler/appError')
const Post = require("./../model/postModel")
import { catchAsync } from "./../ErrorHandler/catchAsync";
import { ObjectId } from 'mongodb'
dotenv.config();
const multerStorage = multer.diskStorage({
  destination: (req: express.Request, file:any, cb:any) => {
    if(req.body.type.includes("track")){
      cb(null,'public/img/tracks' )
    }else if(req.body.type.includes("tvShow")){
      cb(null,'public/img/tvShows' )
    }
 
  },
  filename:async (req:RequestWithUser, file:any, cb:any)=>{
    const ext = file.mimetype.split('/')[1]
    if(req.body.type.includes("track")){
      cb(null, `track-${req.body.id}.${ext}`)
    }else if(req.body.type.includes("tvShow")){

      cb(null, `tvShow-${req.body.id}.${ext}`)
    }

  }
})
const storage = multer.memoryStorage();
const multerFilter = (req: express.Request, file:any, cb:any) => {

  if(file.mimetype.startsWith('image')){
    cb(null, true)
  }else{
    cb(new AppError("Not an image!", 400), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
})

const avatarSetting = multer({
  storage,
  fileFilter: multerFilter
})

export const uploadAvatarMulter = avatarSetting.single("image")
export const uploadImage = upload.single("image")
export const uploadAvatar = catchAsync(async (req:RequestWithUser, res:express.Response, next:express.NextFunction) => {
const path = `./public/img/users/user-${req.user._id}.jpeg`;
await sharp(req.file.buffer).resize(200, 200).toFormat('jpeg').toFile(path);
 const updatedUser = await User.findByIdAndUpdate( {_id:req.user._id}, { avatar : `http://localhost:8080/user/avatar/${req.user.id}`}, { new: true, upsert:true }, ) 
next()
}
)

interface RequestWithUser extends express.Request {
  user?: typeof User; // Add the 'user' property
  file:any
}


const checkToken =async (req:express.Request) => {
  let token
  if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
    token = req.headers.authorization.split(' ')[1];
}
 else if(!token){
  return false
}
const decoded = await jwt.verify(token,process.env.TOKEN_SECRET)
const user = await User.findById(decoded.id)
  if(user){
    return user
  }
return false
} 

export const getUser =catchAsync(async (req:express.Request, res:express.Response) =>{
  const user = await checkToken(req)
  if(user){
    return res.status(201).json({
      status:"success",
      data:{
        user
      }
  })
  }
 else{
      return res.status(401).json({
        status:"success",
        data:{
          message:"Invalid token"
        }
    })
  }
  })

export const userAddTrack =catchAsync(async (req:RequestWithUser, res:express.Response, next: express.NextFunction) => {
  const user = req.user
  const artists = JSON.parse(req.body.artists).map((item:any) => item.name)
  const {id, name, like, type} = req.body
  let updatedUser
  const newTrack = await Track.findOneAndUpdate(   { id } , {vibes:JSON.parse(req.body.vibes),artists, id,name,like,image:`track-${req.body.id}`}, {
    upsert: true, // Create the track if it doesn't exist
    new: true,    // Return the updated or newly created track
  })
  if(type[1] === "listeningTrack"){
    updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { listeningTrack: newTrack._id}}, 
      { new: true },
    );
    const newPost = new Post({
      type:"track",
      isCeleb: user.isCeleb,
      username: user.username,
      avatar:user.avatar,
      track: newTrack._id,
    })
    await newPost.save();
    updatedUser = await User.findByIdAndUpdate(user._id, { $push: { posts:newPost._id} }, { new: true }) 
    notifyUsers(updatedUser._id, "is listening to something!")
  }else if(type[1] === "listenedTrack"){
    updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: { listenedTrack: newTrack._id }}, 
      { new: true },
    );
  }
  return res.status(201).json({
    status:"success",
    data:{
      updatedUser
    }
  })

})


const notifyUsers = async(id:any, message:string) => {
  const user = await User.findById(id)
  await Promise.all(user.followers.map(async(id : ObjectId) => {
    await User.findByIdAndUpdate(id, { $push: {notifications:{
      message,
      username:user.username,
      avatar:user.avatar,
      read:false
    }} }, { new: true },) 
  }))
}

export const userAddTvShow = catchAsync(async (req:RequestWithUser, res:express.Response) => {
  const user = req.user
  const {id, name, like, type,vote_average, overview, origin_country} = req.body
  let updatedUser
  const newTvShow = await TvShow.findOneAndUpdate( {id},{genre:JSON.parse(req.body.genre), vibes:JSON.parse(req.body.vibes),overview,origin_country:JSON.parse(origin_country)[0], vote_average, id,name,recommend: like,image:`tvShow-${req.body.id}`},    {
    upsert: true, // Create the track if it doesn't exist
    new: true,    // Return the updated or newly created track
  })
  if(type[1] === "watching"){
   updatedUser = await User.findByIdAndUpdate(
      user._id, 
      { $push: {  tvShowWatching: newTvShow._id} }, 
      { new: true },
    );
    const newPost = new Post({
      type:"tvShow",
      isCeleb: user.isCeleb,
      username: user.username,
      avatar:user.avatar,
      tvShow:newTvShow._id,
  
    })
    await newPost.save();
    updatedUser = await User.findByIdAndUpdate(user._id, { $push: { posts:newPost._id} },       { new: true },) 
    notifyUsers(updatedUser._id, "is watching something!")
  }else if(type[1] === "watched"){
    updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $push: {  tvShowWatched: newTvShow._id} }, 
      { new: true },
    );
  }
  return res.status(201).json({
    status:"success",
    data:{
      updatedUser
    }
  })

})


export const SearchUserByName = catchAsync(async(req:express.Request, res:express.Response) => {
  const  username   = req.params.username;
  const regex = new RegExp(username , "i")
  const users = await User.find({ username: regex });
  return  res.status(201).json(users);
})

export const UpdateUser =catchAsync(async(req:RequestWithUser, res:express.Response) =>{
  const user = req.user

  return res.json(user)

}) 


export const GetTvShowUser = catchAsync(async(req:RequestWithUser, res:express.Response) =>{
  const userId = req.params.id;
  const user = await User.findById(userId)
  const tvShowId = user.tvShowWatching
  const tvShow = await TvShow.find({ _id: { $in: tvShowId } });
  return res.status(201).json({
    message:"sucess",
    tvShow
  }
  )
})


export const Follow = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = req.user
  const id = req.params.id

 const userMakeFollowreq = await User.findByIdAndUpdate(user._id, { $addToSet: { following:id, } },  {
  upsert: true, 
  new: true,    
},)  
const userGetFollower = await User.findByIdAndUpdate(id, { $addToSet: { followers:user._id,notifications: {
  message:"just follow you!",
  read:false,
  username: userMakeFollowreq.username,
  avatar: userMakeFollowreq.avatar
 }} },  {
    upsert: true, 
    new: true,    
  },)
  return res.status(201).json({
    status:"success",
    user:userMakeFollowreq
  })
})

export const Unfollow = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = req.user
  const id = req.params.id
  console.log("run")
  await User.findByIdAndUpdate(id, { $pull: { followers:user._id} }, {
    upsert: true, 
    new: true,    
  },) 
 const newUser = await User.findByIdAndUpdate(user._id, { $pull: { following:id} },  {
  upsert: true, 
  new: true,   
},) 
  return res.status(201).json({
    status:"success",
    user:newUser
  })
})


export const CheckFollow = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = await User.findById(req.user._id)
  const _id = req.params.id
  const userExist = user.following.some((id:ObjectId)=> id.equals(_id));
  return res.status(201).json({
    userExist: userExist ? true: false
  })
})

export const GetFollower = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = await User.findOne({username: req.params.username})
  

    const followers = await Promise.all(user.followers.map(async(id : ObjectId) => {
      const follower = await User.findById(id)
      return follower
    }))


return res.status(201).json({
  status:"success",
  followers
})
})

export const GetFollowing = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = await User.findOne({username: req.params.username})


    const following = await Promise.all(user.following.map(async(id : ObjectId) => {
      const followingUser = await User.findById(id)
      return followingUser
    }))
  

 return res.status(201).json({
   status:"success",
   following
 })
 })


 export const VerifyUser = catchAsync(async(req:RequestWithUser, res:express.Response)=> {
  const user = await User.findById(req.user._id)
  user.isCeleb = true
  await user.save()
  return res.status(201).json({
    status:"success",
    user
  })

 })


 export const getUserFollowingPosts = catchAsync(async(req:RequestWithUser, res:express.Response, next: express.NextFunction)=> {
    const userId = req.user._id
    const user = await User.findById(userId)
    const following = await Promise.all(user.following.map(async(id : ObjectId) => {
      const followingUser = await User.findById(id)
      return followingUser
    }))
    const postsOfFollowing = await Promise.all(following.map( async(user) =>  { 
      const posts = await Post.find({ username:user.username });
      const postWithData =await Promise.all(posts.map(async(post:typeof Post) => {
          let data
          if(post.type === "track"){
              data = await Track.findById(post.track)
          }else if (post.type==="tvShow"){
              data = await TvShow.findById(post.tvShow)
          }
  
         return {...post._doc, data}
      }))
      return postWithData
    }))
  
    return res.status(201).json({
      status:"success",
        posts: postsOfFollowing
    })
 })