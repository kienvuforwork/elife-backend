
import mongoose from "mongoose";
export interface TvShow {
    id: string;
    name: string;
    vote_average: number;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    genre: string[];
    origin_country: string;
  }

  const TvShowSchema = new mongoose.Schema({
    id: {type:String, unique:true, required:true},
    name:{type:String, required:true},
    vote_average: Number,
    poster_path: String,
    backdrop_path:String,
    overview:String,
    genre: [{type:String}],
    origin_country: String,
    vibes: [{type:String}],
    recommend: Boolean,
    createdAt: {
      type: Date, // Specifies that this field is of type Date
      default: Date.now // Sets the default value to the current date and time
    }
  })
  
  const TvShow = mongoose.model("TvShow", TvShowSchema)
  module.exports = TvShow