const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  projectValidation,
} = require('../controllers/projectController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router
  .route('/')
  .post(protect, authorize('Admin'), projectValidation, createProject)
  .get(protect, getProjects);

router
  .route('/:id')
  .get(protect, getProject)
  .put(protect, authorize('Admin'), projectValidation, updateProject)
  .delete(protect, authorize('Admin'), deleteProject);

module.exports = router;
