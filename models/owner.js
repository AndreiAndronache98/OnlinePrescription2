const mongoose = require('mongoose')
const Pet = require('./pet')

const ownerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

ownerSchema.pre('remove', function(next) {
  Pet.find({ owner: this.id }, (err, pets) => {
    if (err) {
      next(err)
    } else if (pets.length > 0) {
      next(new Error('This owner has pets still'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Owner', ownerSchema)