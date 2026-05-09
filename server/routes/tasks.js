const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  taskValidation,
  updateTaskValidation,
} = require('../controllers/taskController');
const protect = require('../middleware/auth');
const authorize = require('../middleware/role');

router
  .route('/')
  .post(protect, authorize('Admin'), taskValidation, createTask)
  .get(protect, getTasks);

router
  .route('/:id')
  .get(protect, getTask)
  .put(protect, updateTaskValidation, updateTask)
  .delete(protect, authorize('Admin'), deleteTask);

module.exports = router;
