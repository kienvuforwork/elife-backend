import express from "express"
interface CustomError extends Error {
    statusCode?: number;
    status?: string;
  }
module.exports = (err:CustomError, req:express.Request ,res:express.Response, next:express.NextFunction) => {
    console.log(err.stack)
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    })
  }

