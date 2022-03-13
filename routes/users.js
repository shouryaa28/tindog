const mongoose =require('mongoose');
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb+srv://shouryaa:PcMEn3nuShegIvWT@cluster0.vq38k.mongodb.net/test'||'mongodb://localhost/tindog',{useNewUrlParser: true,
useUnifiedTopology: true});

const userSchema = mongoose.Schema({
  name:String,
  username:String,
  password:String,
  profilepic:String,
  posts:[{type:mongoose.Schema.Types.ObjectId,ref:'post'}]
});

userSchema.plugin(plm);

module.exports = mongoose.model('user',userSchema);