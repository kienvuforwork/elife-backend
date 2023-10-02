import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression"
import http from "http";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose'
import router from "./router";
const path = require('path');
const globalErr = require("./controller/errorController")
const AppError = require("./ErrorHandler/appError")

const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500'], // Set your frontend's origin here
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };

  
  const app = express()
  app.use(cookieParser())
  app.use(cors(corsOptions))
  app.use(compression())
  app.use(bodyParser.json())
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  
  
  const server = http.createServer(app)

  const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
    console.log("server running on port 8080!")
})

const MONGO_URL = 'mongodb+srv://elife:elife@cluster0.ksmqir0.mongodb.net/?retryWrites=true&w=majority'
mongoose.Promise = Promise;
mongoose.connect(MONGO_URL);
mongoose.connection.on('error', (error:Error) => console.log(error))



app.use("/", router())
app.all("*", (req:express.Request,res:express.Response,next: express.NextFunction)=> {
  next(new AppError(`cant fint this url: ${req.originalUrl}`, 404))
})


app.use(globalErr)