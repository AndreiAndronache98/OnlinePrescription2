const express = require('express')
const router = express.Router()
const Owner = require('../models/owner')
const Pet = require('../models/pet')

// All Owners Route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== '') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try {
    const owners = await Owner.find(searchOptions)
    res.render('owners/index', {
      owners: owners,
      searchOptions: req.query
    })
  } catch {
    res.redirect('/')
  }
})

// New Owner Route
router.get('/new', (req, res) => {
  res.render('owners/new', { owner: new Owner() })
})

// Create Owner Route
router.post('/', async (req, res) => {
  const owner = new Owner({
    name: req.body.name
  })
  try {
    const newOwner = await owner.save()
    res.redirect(`owners/${newOwner.id}`)
  } catch {
    res.render('owners/new', {
      owner: owner,
      errorMessage: 'Error creating Owner'
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
    const pets = await Pet.find({ owner: owner.id }).limit(6).exec()
    res.render('owners/show', {
      owner: owner,
      petsByOwner: pets
    })
  } catch {
    res.redirect('/')
  }
})

router.get('/:id/edit', async (req, res) => {
  try {
    const owner = await Owner.findById(req.params.id)
    res.render('owners/edit', { owner: owner })
  } catch {
    res.redirect('/owners')
  }
})

router.put('/:id', async (req, res) => {
  let owner
  try {
    owner = await Owner.findById(req.params.id)
    owner.name = req.body.name
    await owner.save()
    res.redirect(`/owners/${owner.id}`)
  } catch {
    if (owner == null) {
      res.redirect('/')
    } else {
      res.render('owners/edit', {
        owner: owner,
        errorMessage: 'Error updating Owner'
      })
    }
  }
})

router.delete('/:id', async (req, res) => {
  let owner
  try {
    owner = await Owner.findById(req.params.id)
    await owner.remove()
    res.redirect('/owners')
  } catch {
    if (owner == null) {
      res.redirect('/')
    } else {
      res.redirect(`/owners/${owner.id}`)
    }
  }
})

module.exports = router