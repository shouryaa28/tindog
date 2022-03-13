var express = require('express');
var router = express.Router();
const userModel = require('./users');
const localstrategy = require('passport-local');
const passport = require('passport');
const postModel = require('./posts')
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage })

passport.use(new localstrategy(userModel.authenticate()));

//Login page i.e. Home page

router.get('/', function(req, res) {
  res.render('index',{pagename:'Login page'});
});

//Register

router.post('/register',function(req,res){
  var newUser = new userModel({
    name:req.body.name,
    username:req.body.username,
  });
  userModel.register(newUser,req.body.password)
  .then(function(createdUser){
    console.log(createdUser);
    passport.authenticate('local')(req,res,function(){
      res.redirect('/match');
    });
  });
});

//Login 

router.post('/login',passport.authenticate('local',{
successRedirect:'/match',
failureRedirect:'/'
}),function(req,res,next){});

//Login page

router.get('/login', function(req,res){
  res.render('login')
})
//Logout

router.get('/logout',function(req,res,next){
  req.logOut();
  res.redirect('/');
});

// isLoggedIn function

function isLoggedIn(req,res,next){
  if(req.isAuthenticated())
  return next();
  res.redirect('/')
};

//Register page

router.get('/reg',function(req,res){
  res.render('register',{pagename:'Register page'})
});

//match

router.get('/match',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.find()
    .populate("author")
    .then(function(allPosts){
      res.render('match',{allPosts,foundUser})
    });
  });
});


//creating posts
router.get('/post',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
    .populate('posts')
    .then(function(foundUser){
      res.render('createpost',{foundUser})
    })
});

router.post('/createPost',upload.single('content'),function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      content:req.file.filename,
      desc:req.body.desc,
      author:foundUser
    })
    .then(function(createdPost){
      foundUser.posts.push(createdPost)
      foundUser.save()
      .then(function(saved){
        res.redirect('/match');
      });
    });
  });
});


router.get('/likes/:id',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
      postModel.findOne({_id:req.params.id})
      .populate("likes")
      .then(function(foundPost){
        if(foundPost.likes.indexOf(foundUser._id) == -1){
          foundPost.likes.push(foundUser._id)
        }
        else
        {
          var index = foundPost.likes.indexOf(foundUser._id);
          foundPost.likes.splice(index,1);
        }
        foundPost.save()
        .then(function(saved){
          res.redirect(req.headers.referer)
        })
    })
  })
});


router.get('/chat',isLoggedIn,function(req,res){
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    res.render('chat',{foundUser})
  })
})


module.exports = router;
