import express from "express"
import { getUser, userAddTrack, uploadImage, SearchUserByName, UpdateUser, userAddTvShow, uploadAvatar, uploadAvatarMulter, GetTvShowUser, Follow, Unfollow, CheckFollow, GetFollower, GetFollowing, VerifyUser, getUserFollowingPosts} from "../controller/userController"
import { protect } from "../controller/authController"
import { GetAvatar } from "../controller/imageController"

export default (router:express.Router)=>{
    router.get("/user", getUser)
    router.post("/user/track",protect,uploadImage, userAddTrack)
    router.post("/user/tvShow",protect,uploadImage, userAddTvShow)
    router.get("/users/:username", SearchUserByName)
    router.post("/user/update", protect,uploadAvatarMulter, uploadAvatar,  UpdateUser)
    router.get("/user/avatar/:id",  GetAvatar)
    router.get("/user/:id/tvShow", GetTvShowUser)
    router.put("/user/follow/:id",protect, Follow)
    router.put("/user/unfollow/:id",protect, Unfollow)
    router.get("/user/is-follow/:id",protect, CheckFollow)
    router.get("/user/:username/follower", GetFollower)
    router.get("/user/:username/following", GetFollowing)
    router.get("/user/following/posts", protect, getUserFollowingPosts)
    // router.post("/user/verify", protect, VerifyUser)
}   