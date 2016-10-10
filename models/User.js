const
  mongoose = require('mongoose')

// Set schema for users
  userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, require: true},
    avatar: String,
    games: [
      {type:mongoose.Schema.Types.ObjestId, ref: 'Game'}
    ]
  },
  {
    timestamps: true
  }
  // end of model
  )

  // Save the schema as a model
  const User = mongoose.model('User', userSchema)
