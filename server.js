if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load()
}

const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const bodyParser = require('body-parser')
const methodOverride = require('method-override')

const indexRouter = require('./routes/index')
const patientRouter = require('./routes/patients')
const prescriptionRouter = require('./routes/prescriptions')

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.use('/', indexRouter)
app.use('/patients', patientRouter)
app.use('/prescriptions', prescriptionRouter)

app.listen(process.env.PORT || 3000)