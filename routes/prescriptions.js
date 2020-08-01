const express = require('express')
const router = express.Router()
const Prescription = require('../models/prescription')
const Patient = require('../models/patient')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Prescriptions Route
router.get('/', async (req, res) => {
  let query = Prescription.find()
  if (req.query.title != null && req.query.title != '') {
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != '') {
    query = query.lte('publishDate', req.query.publishedBefore)
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != '') {
    query = query.gte('publishDate', req.query.publishedAfter)
  }
  try {
    const prescriptions = await query.exec()
    res.render('prescriptions/index', {
      prescriptions: prescriptions,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Prescription Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Prescription())
})

// Create Prescription Route
router.post('/', async (req, res) => {
  const prescription = new Prescription({
    title: req.body.title,
    patient: req.body.patient,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(prescription, req.body.cover)

  try {
    const newPrescription = await prescription.save()
    res.redirect(`prescriptions/${newPrescription.id}`)
  } catch {
    renderNewPage(res, prescription, true)
  }
})

// Show Prescription Route
router.get('/:id', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
                           .populate('patient')
                           .exec()
    res.render('prescriptions/show', { prescription: prescription })
  } catch {
    res.redirect('/')
  }
})

// Edit Prescription Route
router.get('/:id/edit', async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
    renderEditPage(res, prescription)
  } catch {
    res.redirect('/')
  }
})

// Update Prescription Route
router.put('/:id', async (req, res) => {
  let prescription

  try {
    prescription = await Prescription.findById(req.params.id)
    prescription.title = req.body.title
    prescription.patient = req.body.patient
    prescription.publishDate = new Date(req.body.publishDate)
    prescription.pageCount = req.body.pageCount
    prescription.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(prescription, req.body.cover)
    }
    await prescription.save()
    res.redirect(`/prescriptions/${prescription.id}`)
  } catch {
    if (prescription != null) {
      renderEditPage(res, prescription, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Prescription Page
router.delete('/:id', async (req, res) => {
  let prescription
  try {
    prescription = await Prescription.findById(req.params.id)
    await prescription.remove()
    res.redirect('/prescriptions')
  } catch {
    if (prescription != null) {
      res.render('prescriptions/show', {
        prescription: prescription,
        errorMessage: 'Could not remove prescription'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, prescription, hasError = false) {
  renderFormPage(res, prescription, 'new', hasError)
}

async function renderEditPage(res, prescription, hasError = false) {
  renderFormPage(res, prescription, 'edit', hasError)
}

async function renderFormPage(res, prescription, form, hasError = false) {
  try {
    const patients = await Patient.find({})
    const params = {
      patients: patients,
      prescription: prescription
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Prescription'
      } else {
        params.errorMessage = 'Error Creating Prescription'
      }
    }
    res.render(`prescriptions/${form}`, params)
  } catch {
    res.redirect('/prescriptions')
  }
}

function saveCover(prescription, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    prescription.coverImage = new Buffer.from(cover.data, 'base64')
    prescription.coverImageType = cover.type
  }
}

module.exports = router