const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    content:String,
    desc:String,
    likes:{
        type:Array,
        default:[]
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    }
});

module.exports = mongoose.model('post',postSchema);