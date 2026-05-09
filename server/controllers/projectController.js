const { validationResult, body } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');

// Validation rules
exports.projectValidation = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').optional().trim(),
  body('members').optional().isArray().withMessage('Members must be an array'),
];

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const { title, description, members } = req.body;

    const project = await Project.create({
      title,
      description,
      members: members || [],
      createdBy: req.user._id,
    });

    const populated = await Project.findById(project._id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      project: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'Admin') {
      query = Project.find();
    } else {
      // Members can only see projects they are assigned to
      query = Project.find({ members: req.user._id });
    }

    const projects = await query
      .populate('members', 'name email role')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Attach task counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const taskCount = await Task.countDocuments({ projectId: project._id });
        const completedCount = await Task.countDocuments({
          projectId: project._id,
          status: 'Completed',
        });
        return {
          ...project.toObject(),
          taskCount,
          completedCount,
        };
      })
    );

    res.json({
      success: true,
      count: projectsWithCounts.length,
      projects: projectsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Members can only view projects they belong to
    if (
      req.user.role !== 'Admin' &&
      !project.members.some((m) => m._id.toString() === req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this project',
      });
    }

    const tasks = await Task.find({ projectId: project._id })
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      project,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array().map((e) => e.msg).join(', '),
      });
    }

    const { title, description, members } = req.body;

    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description, members },
      { new: true, runValidators: true }
    )
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    // Delete all tasks associated with the project
    await Task.deleteMany({ projectId: project._id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and associated tasks deleted',
    });
  } catch (error) {
    next(error);
  }
};
