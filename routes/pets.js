const express = require('express')
const router = express.Router()
const Pet = require('../models/pet')
const Owner = require('../models/owner')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']

// All Pets Route
router.get('/', async (req, res) => {
  let query = Pet.find()
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
    const pets = await query.exec()
    res.render('pets/index', {
      pets: pets,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Pet Route
router.get('/new', async (req, res) => {
  renderNewPage(res, new Pet())
})

// Create Pet Route
router.post('/', async (req, res) => {
  const pet = new Pet({
    title: req.body.title,
    owner: req.body.owner,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    description: req.body.description
  })
  saveCover(pet, req.body.cover)

  try {
    const newPet = await pet.save()
    res.redirect(`pets/${newPet.id}`)
  } catch {
    renderNewPage(res, pet, true)
  }
})

// Show Pet Route
router.get('/:id', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
                           .populate('owner')
                           .exec()
    res.render('pets/show', { pet: pet })
  } catch {
    res.redirect('/')
  }
})

// Edit Pet Route
router.get('/:id/edit', async (req, res) => {
  try {
    const pet = await Pet.findById(req.params.id)
    renderEditPage(res, pet)
  } catch {
    res.redirect('/')
  }
})

// Update Pet Route
router.put('/:id', async (req, res) => {
  let pet

  try {
    pet = await Pet.findById(req.params.id)
    pet.title = req.body.title
    pet.owner = req.body.owner
    pet.publishDate = new Date(req.body.publishDate)
    pet.pageCount = req.body.pageCount
    pet.description = req.body.description
    if (req.body.cover != null && req.body.cover !== '') {
      saveCover(pet, req.body.cover)
    }
    await pet.save()
    res.redirect(`/pets/${pet.id}`)
  } catch {
    if (pet != null) {
      renderEditPage(res, pet, true)
    } else {
      redirect('/')
    }
  }
})

// Delete Pet Page
router.delete('/:id', async (req, res) => {
  let pet
  try {
    pet = await Pet.findById(req.params.id)
    await pet.remove()
    res.redirect('/pets')
  } catch {
    if (pet != null) {
      res.render('pets/show', {
        pet: pet,
        errorMessage: 'Could not remove pet'
      })
    } else {
      res.redirect('/')
    }
  }
})

async function renderNewPage(res, pet, hasError = false) {
  renderFormPage(res, pet, 'new', hasError)
}

async function renderEditPage(res, pet, hasError = false) {
  renderFormPage(res, pet, 'edit', hasError)
}

async function renderFormPage(res, pet, form, hasError = false) {
  try {
    const owners = await Owner.find({})
    const params = {
      owners: owners,
      pet: pet
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Pet'
      } else {
        params.errorMessage = 'Error Creating Pet'
      }
    }
    res.render(`pets/${form}`, params)
  } catch {
    res.redirect('/pets')
  }
}

function saveCover(pet, coverEncoded) {
  if (coverEncoded == null) return
  const cover = JSON.parse(coverEncoded)
  if (cover != null && imageMimeTypes.includes(cover.type)) {
    pet.coverImage = new Buffer.from(cover.data, 'base64')
    pet.coverImageType = cover.type
  }
}

module.exports = router