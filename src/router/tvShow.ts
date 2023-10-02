import {  GetTvShowImage } from "../controller/imageController"
import express from "express"

export default (router:express.Router)=>{
    router.get("/tvShow/image/:id", GetTvShowImage)
}