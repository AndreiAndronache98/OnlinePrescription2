const express = require('express')
const router = express.Router()
const Patient = require('../models/patient')
const Prescription = require('../models/prescription')

// All Patients Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const patients = await Patient.find(searchOptions)
    res.render('patients/index', {
      patients: patients,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Patient Route
router.get('/new', (req, res) => {
  res.render('patients/new', { patient: new Patient() })
})

// Create Patient Route
router.post('/', async (req, res) => {
  const patient = new Patient({
    name: req.body.name
  })
  try {
    const newPatient = await patient.save()
    res.redirect(`patients/${newPatient.id}`)
  } catch {
    res.render('patients/new', {
      patient: patient,
      errorMessage: 'Error creating Patient'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
    const prescriptions = await Prescription.find({ patient: patient.id }).limit(6).exec()
    res.render('patients/show', {
      patient: patient,
      prescriptionsByPatient: prescriptions
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
    res.render('patients/edit', { patient: patient })
  } catch {
    res.redirect('/patients')
  }
})

router.put('/:id', async (req, res) => {
  let patient
  try {
    patient = await Patient.findById(req.params.id)
    patient.name = req.body.name
    await patient.save()
    res.redirect(`/patients/${patient.id}`)
  } catch {
    if (patient == null) {
      res.redirect('/')
    } else {
      res.render('patients/edit', {
        patient: patient,
        errorMessage: 'Error updating Patient'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let patient
  try {
    patient = await Patient.findById(req.params.id)
    await patient.remove()
    res.redirect('/patients')
  } catch {
    if (patient == null) {
      res.redirect('/')
    } else {
      res.redirect(`/patients/${patient.id}`)
    }
  }
})

module.exports = router