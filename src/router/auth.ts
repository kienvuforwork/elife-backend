import express from "express"

import { register,login, checkEmail } from "../controller/authController"

export default (router:express.Router)=>{
    router.post("/auth/register", register)
    router.post("/auth/login", login)
    router.post("/auth/check-email",  checkEmail )

}   