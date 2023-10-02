import mongoose from "mongoose";


const PostSchema =new mongoose.Schema({
    type: {
        type: String,
        enum: ['tvShow', 'track'],
    },
    isCeleb: {
        type: Boolean,
      },
    username: {
        type: String,
        required: true,
      },
    avatar:{type:String},
    customDate: {
        type: Date,
        default: Date.now,
      },
      track:     {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Track'
     
    },
       tvShow: {
     type: mongoose.Schema.Types.ObjectId,
        ref: 'TvShow'
       },
})





const Post = mongoose.model("Post", PostSchema)
module.exports = Post
