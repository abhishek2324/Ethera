const { validationResult, body } = require('express-validator');
const Task = require('../models/Task');

// Validation rules
exports.taskValidation = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
  body('projectId').notEmpty().withMessage('Project reference is required'),
];

exports.updateTaskValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Priority must be Low, Medium, or High'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage('Status must be Pending, In Progress, or Completed'),
];

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin)
exports.createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const { title, description, priority, status, dueDate, assignedTo, projectId } =
      req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      status,
      dueDate,
      assignedTo,
      projectId,
      createdBy: req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      task: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    let filter = {};

    // Members can only see tasks assigned to them
    if (req.user.role !== 'Admin') {
      filter.assignedTo = req.user._id;
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    // Filter by project
    if (req.query.projectId) {
      filter.projectId = req.query.projectId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Members can only view tasks assigned to them
    if (
      req.user.role !== 'Admin' &&
      task.assignedTo?._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this task',
      });
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Members can only update status of tasks assigned to them
    if (req.user.role !== 'Admin') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this task',
        });
      }
      // Members can only change status
      const updateData = { status: req.body.status };
      task = await Task.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    } else {
      // Admin can update everything
      const { title, description, priority, status, dueDate, assignedTo, projectId } =
        req.body;
      task = await Task.findByIdAndUpdate(
        req.params.id,
        { title, description, priority, status, dueDate, assignedTo, projectId },
        { new: true, runValidators: true }
      )
        .populate('assignedTo', 'name email')
        .populate('projectId', 'title')
        .populate('createdBy', 'name email');
    }

    res.json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin)
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task deleted',
    });
  } catch (error) {
    next(error);
  }
};
