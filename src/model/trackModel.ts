import mongoose from "mongoose";
export interface Track {
    id: string | number;
    name: string;
    artists: string[];
    image: string;
    releaseDate: string;
  }
  

const TrackSchema = new mongoose.Schema({
  id: {type:String, unique:true,required:true },
  name:{type:String, required:true},
  artists: { type: [{type:String}], required:true },
  image: String,
  releaseDate: String,
  like: Boolean,
  createdAt: {
    type: Date, // Specifies that this field is of type Date
    default: Date.now // Sets the default value to the current date and time
  }
})




const Track = mongoose.model("Track", TrackSchema)
module.exports = Track