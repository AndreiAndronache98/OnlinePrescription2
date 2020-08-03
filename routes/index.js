const express = require('express')
const router = express.Router()
const Pet = require('../models/pet')

router.get('/', async (req, res) => {
  let pets
  try {
    pets = await Pet.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    pets = []
  }
  res.render('index', { pets: pets })
})

module.exports = router