const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboard = async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'Admin';
    const userId = req.user._id;

    let taskFilter = {};
    let projectFilter = {};

    if (!isAdmin) {
      taskFilter = { assignedTo: userId };
      projectFilter = { members: userId };
    }

    // Get task counts
    const totalTasks = await Task.countDocuments(taskFilter);
    const completedTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'Completed',
    });
    const pendingTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'Pending',
    });
    const inProgressTasks = await Task.countDocuments({
      ...taskFilter,
      status: 'In Progress',
    });
    const overdueTasks = await Task.countDocuments({
      ...taskFilter,
      status: { $ne: 'Completed' },
      dueDate: { $lt: new Date() },
    });

    // Get project count
    const totalProjects = await Project.countDocuments(projectFilter);

    // Get team member count (Admin only)
    const totalMembers = isAdmin ? await User.countDocuments() : 0;

    // Recent tasks (last 10)
    const recentTasks = await Task.find(taskFilter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    // Tasks assigned to the current user
    const myTasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'title')
      .sort({ dueDate: 1 })
      .limit(5);

    // Priority distribution
    const highPriority = await Task.countDocuments({ ...taskFilter, priority: 'High' });
    const mediumPriority = await Task.countDocuments({
      ...taskFilter,
      priority: 'Medium',
    });
    const lowPriority = await Task.countDocuments({ ...taskFilter, priority: 'Low' });

    res.json({
      success: true,
      dashboard: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        overdueTasks,
        totalProjects,
        totalMembers,
        recentTasks,
        myTasks,
        priorityDistribution: {
          high: highPriority,
          medium: mediumPriority,
          low: lowPriority,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
