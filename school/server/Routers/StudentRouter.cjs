const express = require('express')
const router = express.Router()
const StudentController = require('../Controllers/StudentController.cjs')
const multer = require('multer')

const upload = multer({dest: 'upload/'})

router.post('/login',StudentController.login)
router.post('/sendLink',StudentController.sendLink)
router.post('/changePassword',StudentController.changePassword)
router.post('/validateToken',StudentController.validateToken)
router.post('/getAssignments',StudentController.getAssignments)
router.post('/submitMyAssignment',upload.single('file'),StudentController.submitMyAssignment)
router.post('/getAttendancePercent',StudentController.getAttendancePercent)

module.exports = router;