import express from "express"

export const catchAsync = (fn:any) =>{
    return (req:express.Request,res:express.Response,next:express.NextFunction) => {
        fn(req,res,next).catch((err:Error) => next(err))
    }
  }