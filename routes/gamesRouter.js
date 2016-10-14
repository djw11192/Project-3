var
  express = require('express'),
  passport = require('passport'),
  gamesRouter = express.Router(),
  gamesController = require('../controllers/gamesController.js'),
  Game = require('../models/Game.js'),
  User = require('../models/User.js'),
  randomWord = require('../words')

gamesRouter.route('/game/:id/library')
  .get(gamesController.index)

gamesRouter.patch('/game/:id/library/newcomment', function(req, res){
  Game.findById(req.params.id,function(err, game){
    game.rounds.forEach(function(r){
      r.pics.forEach(function(p){
        if(p._id = req.body.picId){
          picOfIntent = p
        }
      })
    })
  })
  console.log(p)
  res.json(p)
})

gamesRouter.get('/game/:id', function(req, res){
  Game.findById(req.params.id).populate("users rounds.picker winners.user").exec(function(err, game){
    if(err) throw err;
    console.log(game)
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

gamesRouter.delete('/game/:id', function(req, res) {
  Game.findByIdAndRemove(req.params.id, function(err, game) {
    if(game) return res.json({message: "Game Deleted", success: true})
    res.json({message: "No game to delete", success: false})
  })
})


gamesRouter.patch('/game/:id/new_photo', function(req, res){
  Game.findById(req.params.id, function(err, game){
    var currentRound = game.rounds[game.rounds.length - 1]
    currentRound.pics.push(req.body)
    game.save(function(err, game) {
      res.json(game)
    })
  })
})

gamesRouter.get('/game/:id/photos', function(req, res){
  Game.findById(req.params.id, function(err, game){
    var currentRound = game.rounds[game.rounds.length - 1]
    console.log(currentRound.pics)
    res.json(currentRound.pics)
  })
})

gamesRouter.patch('/game/:id/new_round', function(req, res){
  Game.findById(req.params.id, function(err, game){
    game.rounds.push(req.body)
    game.rounds[game.rounds.length - 1].word = randomWord[Math.floor((Math.random() * (randomWord.length - 1)) + 1)]
    game.save(function(err, game) {
      res.json(game)
    })
  })
})

gamesRouter.patch('/game/:id/winner', function(req, res){
  Game.findById(req.params.id, function(err, game){
    game.winners.push(req.body)
    game.save(function(err, game) {
      res.json(game)
    })
  })
})

gamesRouter.get('/game/:id/members', function(req, res){
  Game.findById(req.params.id).populate("users").exec(function(err, game){
    if(err) return console.log(err)
    res.render('members-page', {game: game})
  })
})


/// PATCH add members to current game.
gamesRouter.patch('/game/:id/members', function(req,res){
  Game.findById(req.params.id, function(err,game){
    if (err) throw err
    if(game){
      User.findOne({"local.email": req.body.email}, function(err,user){
        console.log(user);
        if(!user){
          res.json({message:"user not found"})
        }
        else{
          game.users.push(user)
          // if(hasDuplicates(game.users)){
          //   res.json({game: game, message:"user already been added"})
          // }
          // else{
            game.save(function(err){
              if(err) throw err
              res.json(game)
            })
          // }
        }
      })
    }
  })
})

// PATCH remove user from current game
gamesRouter.patch('/game/:id/members', function(req,res){
  Game.findById(req.params.id, function(err,game){
    if(err) throw err
    if(game){
      User.findOne({"local.email": req.body.email}, function(err,user){
        console.log(user);
        if(!user){
          res.json({message:"user not found"})
        }
        else{
          game.users.removeMember(user)
            game.save(function(err){
              if(err) throw err
              res.json(game)
            })
        }
      })
    }
  })
})







// gamesRouter.get('/game/:id/member/:member', function(req, res){
//   Game.findById(req.params.id, function(err, game){
//     var currentRound = game.rounds[game.rounds.length-1]
//     var picsThisRound = currentRound.pics
//     res.json(picsThisRound)
//   })
// })

gamesRouter.get('/game/:id/all', function(req, res){
  Game.findById(req.params.id, function(err, game){
    res.json(game)
  })
})
gamesRouter.get('/game/:id/winners', function(req, res){
  Game.findById(req.params.id, function(err, game){
    res.render('winners', {game: game})
  })
})







module.exports = gamesRouter
