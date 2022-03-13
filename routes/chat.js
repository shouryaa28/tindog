const mongoose=require('mongoose')

var chatSchema=mongoose.Schema({
  msg:String,
  created:{
    type:Date,
    default:Date.now
  }
})

module.exports=mongoose.model('message',chatSchema)