// import express from 'express';
// import { getAllUsers, getComplaints } from '../controllers/statsController.js';
const express = require('express');
const { getAllUsers, getComplaints } = require('../controllers/statsController');

const router = express.Router();

router.get('/getAllUsers', getAllUsers);
router.get('/getAllComplaints', getComplaints);



module.exports = router;