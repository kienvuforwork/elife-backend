import express from "express";
const Post = require("./../model/postModel")
const User = require('./../model/UserModel')
const AppError = require("./../ErrorHandler/appError")
import { catchAsync } from "./../ErrorHandler/catchAsync";
const Track = require("../model/trackModel")
const TvShow = require("../model/tvShowModel")


interface RequestWithUser extends express.Request {
    user?: typeof User; // Add the 'user' property
  }
  

export const post = catchAsync(async (req:express.Request, res:express.Response) => {
    const data = req.body
    const newPost= await Post.create({data})
    return res.status(201).json({
        status:"sucess",
        data:{
            newPost
        }
    })
})

export const getUserPost = catchAsync(async(req:express.Request, res:express.Response, next:express.NextFunction) => {
    const username = req.params.username
    let user
    try{
         user = await User.find({username: username}).then((res: any) => res )
    }catch(e){
        return next(new AppError(`no user eixt`, 404))
    }

    const posts = await Post.find({ username:username });
    const postWithData =await Promise.all(posts.map(async(post:typeof Post) => {
        let data
        if(post.type === "track"){
            data = await Track.findById(post.track)
        }else if (post.type==="tvShow"){
            data = await TvShow.findById(post.tvShow)
        }

       return {...post._doc, data}
    }))
   
    return res.status(201).json({
        message:'success',
       postWithData
    })
})



export const deletePost =  catchAsync(async(req:RequestWithUser, res:express.Response, next:express.NextFunction) => {
    const id = req.params.id
    const user = req.user
    if(user.posts.includes(id)){
        const isDelete = await Post.findByIdAndDelete(id)
        await User.findByIdAndUpdate(user._id, { $pull: { posts:id} }, {
            upsert: true, // Create the track if it doesn't exist
            new: true,    // Return the updated or newly created track
          },) 
          if(isDelete){
            return res.status(201).json({
                status:"success"   , message:"deleted"
            })
          }

    }
  
    return res.status(201).json({
        status:"fail",
        message:"You dont own this post!"
        
    })

})

export const getCelebPost = catchAsync(async(req:RequestWithUser, res:express.Response, next:express.NextFunction) => {
    const posts = await Post.find({isCeleb:true})
    const postWithCeleb =await Promise.all(posts.map(async(post:typeof Post) => {
        let data
        if(post.type === "track"){
            data = await Track.findById(post.track)
        }else if (post.type==="tvShow"){
            data = await TvShow.findById(post.tvShow)
        }

       return {...post._doc, data}
    }))
    return res.status(201).json({
        status:"success",
       postWithCeleb
        
    })
})