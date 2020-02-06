const Sequelize = require('sequelize');
const Model = require('./model.js');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var cookieParser = require('cookie-parser');
//var flash = require('connect-flash');
//var flash = require('req-flash');
var connect = require("connect");
var router = require("router");
var flash = require('express-flash-messages')
var app = express();
var router = router()
var sess = {
  secret: 'keyboard cat',
  cookie: {}
}
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}
var Users = []; 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('trust proxy', 1)
app.use(cookieParser());
app.use(session({
    'secret': '1234',
    saveUninitialized: false,
    resave: false,
    cookie:{maxAge:60000}
}))
app.use(flash());
var sess = {};

app.set('view engine', 'ejs'); 

var data = {
    emailError:'',
    passwordError:''
}


app.get('/', function(req,res){
  
   res.render('login',{data:''});
})

  app.get('/home',function(req,res){
    
    sess = req.session;
    if (sess.loggedIn=='true') {
        console.log('user already logged in')
        return res.render('home');
    }else{
        console.log('user not logged in')
        return res.redirect('/newlogin');
    }
})

 app.get('/post', function(req,res){


   sess = req.session;
    if (sess.loggedIn=='true') {
        console.log('user already logged in')
        return res.render('post');
    }else{
        console.log('user not logged in')
        return res.redirect('/newlogin');
    }
})

app.get('/new', function(req,res){
   res.render('new');
}) 
app.get('/newlogin', function(req,res){
    sess = req.session;
    // console.log(sess)
    if (sess.loggedIn=='true') {
        console.log('user already logged in')
        return res.redirect('home');
    }else{
        console.log('user not logged in')
        return res.render('newlogin',{data:data});
    }
}) 

app.get('/signup', function(req,res){
   res.render('login',{data:''});
}) 
app.get('/profile', function(req,res){
   res.render('profile');
}) 

app.get('/login/user', function(req,res){
   res.redirect('home');
})

app.get('/seepost', function(req,res){
   res.render('seepost');
}) 

// Signup Api

app.post('/login',function(req,res){
 
 var data = {}
  var password = req.body.password;
  var confirm = req.body.confirm;
  var email = req.body.email;
  var data = req.body;
       
   Model.Users.findOne({
    where:{
        email:email
    }
    }).then(userData=> {
          
      if(userData){
        data.emailError = 'Email already exits.';
        return res.render('login',{data:data});
      }
      else if(password == confirm){
      
          Model.Users.create({
            name:data.name,
            email:data.email,
            password:data.password
  })
           req.flash('notify', 'signup successful!')
   return res.redirect('/newlogin');


}else{ 
      data.passwordError = 'confirm password not matched.';
  return res.render('login', {data:data});}
 
  },error=>{
    console.log(error);
    res.send({
      error:error
    })
  })
})


// Signin Api

app.post('/login/user',function(req,res, next){
  
    var email = req.body.email;
    var password = req.body.password;
    var data = {}
    Model.Users.findOne({
        where:{
            email:email,
            // password:password
        }
    }).then(userEmail=> {
        sess = req.session;
        if(userEmail){
         
            Model.Users.findOne({
                where:{
                    email:email,
                    password:password
                }
            }).then(userData=> {
                if(userData){
                    sess.loggedIn   = 'true';
                    sess.email      = email;
                    // req.session.password = password;
                    // req.session.loggedIn=true;
                    // console.log(req.session.email);
                    // console.log(req.session.password);
                    return res.redirect('/home');  
                }else{
                    data.passwordError = 'Email and Password does not matched.';
                    return res.render('newlogin',{data:data});
                }
            },error=>{
                console.log(error);
                res.send({
                    error:error
                })
            })
            // return res.redirect('home');  
        }else{
            data.emailError = 'Email and Password does not matched.';
            return res.render('newlogin',{data:data});
        }
      
    },error=>{
        console.log(error);
        res.send({
            error:error
        })
    })
})


// logout user
// app.get('/logout', function (req, res) {
//    req.session.loggedIn=false;
//          res.redirect('/newlogin');

    
//   });



app.get('/logout', function(req, res, next) {
    // console.log(req.session);
    // delete session object
    // req.session.destroy(function(err,resp) {
    //   if(err) {
    //     console.log('err',err)
    //   } else {
    //     console.log('resp',resp)
    //     return res.redirect('/newlogin');
    //   }
    // });

    req.session.destroy((err) => {
        if(err) {
            return console.log('err',err);
        }
        // console.log('resp',resp)
        return res.redirect('/newlogin');

    });
  
});





// User insert post

app.post('/post/add',function(req,res, next){
 
  var data = req.body;
  var title = req.body.title;
  var newcategory = req.body.category;
  //console.log(data);

  Model.User.create({
    title:data.title,
    post:data.post,
    status:data.status,
    category:data.category

  })


Model.categorys.findAll().then(User => {
      console.log(JSON.stringify(User));  
      //console.log(User.length);  
       console.log('farhan');  
      
    }).then(userData=> {
     req.flash('notify', 'post inserted successful!')
   return res.redirect('/new');


  },error=>{
    console.log(error);
    res.send({
      error:error
    })
  })

})
// User see all post

  app.get('/select',function(req,res){

    getAllUser(function(resp){
        if (resp =='error') {
            console.log('error')
        }else{
          console.log(resp);
            res.render('category',{

                user: resp
            })
        }
    });
})

function getAllUser(callback) {
    Model.User.findAll().then(data=>{
        callback(data)
    },error=>{
        console.log(error)
        callback('error')
    });

}

// User delete Api

  app.get('/delete/:id',function(req,res){
    var id = req.params.id;
    Model.User.destroy({
        where:{ 
            id:id
        }
    }).then(deletedUser => {
        // var user = []
        // res.render('category',{
        //     user: user
        // })
        getAllUser(function(err,resp){
            if (resp =='error') {
                console.log('error')
            }else{
              req.flash('notify', 'Deleted successful!')
                return res.redirect('/select');
                // res.render('category',{
                //     user: resp
                // })
            }
        });
    }).catch(error =>{
        console.log('error',error)
        res.send({
            error: true,
            user: [],
            error: error
        })
    });
})


app.get('/edit/:id', function(req,res){
   var id = req.params.id;
    
 
   Model.User.findOne({
    where:{
        id:id
    }
   }).then(user => {
          console.log(user);
        res.render('edit',{
            user: user
        })
   }).catch(error => {
        res.send({
            error: true,
            user: [],
            error: error
        });
   })
})


// see post

    app.get('/seepost/:id', function(req,res){
   var id = req.params.id;
    
 
   Model.User.findOne({
    where:{
        id:id
    }
   }).then(user => {
          console.log(user);
        res.render('seepost',{
            user: user
        })
   }).catch(error => {
        res.send({
            error: true,
            user: [],
            error: error
        });
   })
})


// update query

app.post('/post/edit/:id',function(req,res){
  
  var data = req.body;
  
  var id = req.params.id;

  Model.User.update({
    title:data.title,
    post:data.post,
     status:data.status,
    category:data.category
  },{
    where:{
        id:id
    }
  }).then(userData=> {
    req.flash('notify', 'Updated successful!')
    return res.redirect('/select');
  },error=>{
    console.log(error);
    res.send({
      error:error
    })
  })
})
app.listen(3005, '192.168.0.64');