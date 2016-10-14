//user routes
var
  express = require('express'),
  passport = require('passport'),
  usersRouter = express.Router(),
  usersController = require('../controllers/usersController.js'),
  User = require('../models/User.js'),
  Game = require('../models/Game.js'),
  mongodClient = require('mongod'),
  randomWord = require('../words.js')


//The root will be the login page which is set up in the server. First route from there will be signup
usersRouter.route('/')
  .get(usersController.login)
  .post(passport.authenticate('local-login', {
  successRedirect: '/games',
  failureRedirect: '/'
}))


usersRouter.route('/signup')
  .get(usersController.new)
  .post(passport.authenticate('local-signup', {
    successRedirect: '/games',
    failureRedirect: '/signup'
  }))
//to gamesRouter
usersRouter.get('/games', isLoggedIn, function(req, res) {
    Game.find({ 'users': { "$in" : [req.user._id]}}).populate('users').exec(function(err, games){
      res.render('lobby', {user: req.user, games: games})
    });

    // console.log(req.user);
})

// Route to create new game,
usersRouter.post('/games/new', function(req, res){

User.find({'local.email': {
  $in: [
    req.body.user2email,
    req.body.user3email,
    req.body.user4email,
    req.body.user5email,
    req.body.user6email
  ]
}}, function(err, users){
  console.log(users);
  var gameProps = {
    name: req.body.name,
    current_round: 1,
    users: users.map(function(u) {
      return u._id
    }),
    rounds: {picker: req.user.id, round: 1, word: randomWord[Math.floor((Math.random() * (randomWord.length - 1)) + 1)]}
  }
  gameProps.users.unshift(req.user.id)
  Game.create(gameProps, function(err, game){
    res.redirect('/game/' + game.id)
    // end of create function

  })
})





  // end of .post
})

usersRouter.get('/logout', function(req, res){
     //destroy the session and redirect to home page
     req.logout()
     res.redirect('/')
   })

//routes facebook authenticate
usersRouter.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}))

usersRouter.get('/auth/facebook/callback', passport.authenticate('facebook', {
   successRedirect: '/games',
   failureRedirect: '/'
}))

usersRouter.use(isLoggedIn)

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next()
  res.redirect('/')
}

//edit update set-up


usersRouter.patch('/profile', function(req,res){
User.findById(req.user._id, function(err,user){
    if (err) return console.log(err)
    for(key in req.body.local){
      if(req.body.local[key] !="") user.local[key] = req.body.local[key]
    }
    user.save(function(err){
        res.redirect('/games')
    })
  })
})
//edit update profile  change to '/profile/edit'
usersRouter.get('/profile/edit', function(req,res){
  res.render('editProfile', {message: req.flash('editProfileMessage')})
})

// usersRouter.patch('/game/:id/new_member', function(req, res){
//   User.find({'local.email': req.body}, function(err, user){
//     var newUser = user;
//     Game.findById(req.params.id, function(err, game){
//       game.users.push(newUser)
//
//     })
//   })
// })





module.exports = usersRouter;
