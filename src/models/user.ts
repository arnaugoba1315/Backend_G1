import mongoose, {Schema} from "mongoose";
const userSchema = new mongoose.Schema({
    username :{
        type: String,
        unique: true,
        require: true
    },
    password :{
        type: String,
        require: true
    },
    email :{
        type: String,
        unique: true,
        require: true
    },
    profilePicture :{
        type: String,
        require: false
    },
    bio :{
        type: String,
        require: false
    },
    level :{
        type: Number,
        default: 0,
        require: true
    },
    totalDistance :{
        type: Number,
        default: 0,
        require: true
    },
    totalTime :{
        type: Number,
        default: 0,
        require: true
    },
    activities :[{
        type: Schema.Types.ObjectId,
        ref: 'Activity',
        require: true
    }],
    achievements :[{
        type: Schema.Types.ObjectId,
        ref: 'Achievement',
        require: true
    }],
    challengesCompleted :[{
        type: Schema.Types.ObjectId,
        ref: 'Challenge',
        require: true
    }],
    createdAt :{
        type: Date,
        default: Date.now,
        require: true
    },
    updateAt :{
        type: Date,
        default: Date.now,
        require: true
    },
    visibility :{
        type: Boolean,
        default: true,
        require: true
    }
});


const User = mongoose.model('User', userSchema);
export default User;