import mongoose from "mongoose";
const bcrypt = require('bcryptjs')


const UserSchema = new mongoose.Schema({
    username: {type:String, required:true, unique: true},
    email: {type:String , unique:true,lowercase:true,required:true},
    password:{type:String, required:true, minlength:8,select:false},
    avatar: String,
    isCeleb: Boolean, 
    followers:{ type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }], default:[]
    },
    following:{ type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }], default:[]
      },
     tvShowWatching: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TvShow'
     }],
     tvShowWatched: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TvShow'
     }],
     listeningTrack : [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Track'
  }],
  listenedTrack :[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'

}],
  posts : [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  notifications: {
    type: [{
      message:String,
      read:Boolean,
      username:String,
      avatar:String
    }]
  }
})

UserSchema.pre('save', async function(next){
  if(!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password,12);
  next()
  
})



UserSchema.methods.correctPassword=async function(givenPassword: String, password: String): Promise<boolean>{
  return await bcrypt.compare(givenPassword, password);
} 


const User = mongoose.model('User',UserSchema)
module.exports = User


