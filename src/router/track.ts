import { GetTrackImage } from "../controller/imageController"
import express from "express"

export default (router:express.Router)=>{
    router.get("/track/image/:id", GetTrackImage)
}