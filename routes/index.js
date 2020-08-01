const express = require('express')
const router = express.Router()
const Prescription = require('../models/prescription')

router.get('/', async (req, res) => {
  let prescriptions
  try {
    prescriptions = await Prescription.find().sort({ createdAt: 'desc' }).limit(10).exec()
  } catch {
    prescriptions = []
  }
  res.render('index', { prescriptions: prescriptions })
})

module.exports = router