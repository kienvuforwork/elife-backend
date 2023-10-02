import express from "express"
import { deletePost, getCelebPost, getUserPost} from "../controller/postController"
import { protect } from "../controller/authController"


export default (router:express.Router)=>{
    router.get("/post/user/:username",  getUserPost)
    router.delete("/post/:id",protect , deletePost)
    router.get("/post/celeb", getCelebPost)
}   