const mongoose = require('mongoose')
const Prescription = require('./prescription')

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

patientSchema.pre('remove', function(next) {
  Prescription.find({ patient: this.id }, (err, prescriptions) => {
    if (err) {
      next(err)
    } else if (prescriptions.length > 0) {
      next(new Error('This patient still has prescriptions'))
    } else {
      next()
    }
  })
})

module.exports = mongoose.model('Patient', patientSchema)
