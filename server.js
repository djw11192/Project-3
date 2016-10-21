var
    express = require('express'),
    app = express()
    ejs = require('ejs'),
    ejsLayouts = require('express-ejs-layouts'),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    passport = require('passport'),
    passportConfig = require('./config/passport.js'),
    usersRouter = require('./routes/usersRouter.js'),
    gamesRouter = require('./routes/gamesRouter.js'),
    User = require('./models/User.js'),
    Game = require('./models/Game.js'),
    dotenv = require('dotenv').load({silent: true}),
    methodOverride = require('method-override'),
    request = require('request'),
    http = require('http').Server(app);
    socketIO = require('socket.io');
    socketServer = socketIO(http);


///mongoose
var port = process.env.PORT || 3000
var mongoConnectionString = process.env.MONGO_URL

mongoose.connect(process.env.MONGO_URL, function(err){
  	if(err) return console.log('Cannot connect to Mongo')
  	console.log('Connected to MongoDB. Hell Yeah!')
})

app.use(logger('dev'))
app.use(methodOverride('_method'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(session({
	secret: 'gaboom',
	cookie: {maxAge: 6000000},
	resave: true,
	saveUninitialized: false,
  store: new MongoStore({url: mongoConnectionString})
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())//flash application

//this will add a currentUser to be available in every view
app.use(function(req,res,next){
  if(req.user) req.app.locals.currentUser = req.user
  req.app.locals.loggedIn = !!req.user
  next()
})

// ejs configuration
app.set('view engine', 'ejs')
app.use(ejsLayouts)
app.use(express.static('public'))


//root route for now. Later can change it to the game page
app.get('/', function(req,res){
  if (req.app.locals.loggedIn){res.redirect('/games')}
  else{res.render('login')}
})

// all user routes and game routes:
app.use('/', usersRouter, gamesRouter)


/////////Google API/////////////
app.get('/google/:word', function(req, res){
  var api = 'https://www.googleapis.com/customsearch/v1?q='+req.params.word+'&num=9&start=1&imgSize=medium&searchType=image&key='+process.env.GOOGLE_API+'&cx='+process.env.CX

  request.get(api, function(err, googleResponse, googleBody){
    var images = JSON.parse(googleBody).items
    var html ="";
    images.forEach(function(img){
      html += '<img class="photo photoWidth" src="' + img.link + '">'
    })
    res.send(html)
    // res.json(images)
  })
})


////////testing namespaces/////////
app.get('/game/:id', function(req, res){
  if(socketServer.nsps['/'+req.params.id.toString()]){

  } else {
    var nsp = socketServer.of('/'+(req.params.id).toString())

    nsp.on('connection', function(socket){
      nsp.emit('testRes', "Hello")

      console.log('A client connected')
      socket.on('reqCheckmark', function(data){
        console.log("Kobe sucks")
        nsp.emit('resCheckmark', data)
      })
    })
  }
  Game.findById(req.params.id).populate("users rounds.picker winners.user").exec(function(err, game){
    if(err) throw err;
    var currentRound = game.rounds[game.rounds.length-1]
    var picsThisRound = currentRound.pics
    // logic for stopping player for selecting multiple pictures
    var picId = []
    var pics = game.rounds[game.rounds.length-1].pics
    for(i=0;i<pics.length; i++){
      picId.push(pics[i].user)

    }
    console.log("Console log below:");
    console.log(game.rounds[game.rounds.length-1].pics);
    if(req.user.id == game.rounds[game.rounds.length-1].picker._id){
      res.render('game-picker', {game: game, picId: picId, picsThisRound})
      console.log();
    } else{
      res.render('game-player', {game: game, picId: picId, picsThisRound})
      console.log();
    }
  })
})





/////////////Server/////////////////
http.listen(port, function(){
	console.log("Server running on port: ", port)
})
