const departmentService = require('../../../services/department.service');
const { asyncHandler } = require('../../../utils/error.utils');
const { status: { HTTP_STATUS } } = require('../../../constants');
const { objectId } = require('../../../utils/validation.utils');

/**
 * Get all departments with pagination
 * @route GET /api/v1/departments
 */
const getDepartments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;
  
  // Build filter
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  const departments = await departmentService.getDepartments(filter, {
    page: parseInt(page),
    limit: parseInt(limit)
  });
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Departments retrieved successfully',
    data: departments
  });
});

/**
 * Get department by ID
 * @route GET /api/v1/departments/:id
 */
const getDepartmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const department = await departmentService.getDepartmentById(id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department retrieved successfully',
    data: department
  });
});

/**
 * Get department by code
 * @route GET /api/v1/departments/code/:code
 */
const getDepartmentByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  
  const department = await departmentService.getDepartmentByCode(code);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department retrieved successfully',
    data: department
  });
});

/**
 * Create a new department
 * @route POST /api/v1/departments
 */
const createDepartment = asyncHandler(async (req, res) => {
  const departmentData = req.body;
  
  const department = await departmentService.createDepartment(departmentData, req.user.id);
  
  res.status(HTTP_STATUS.CREATED.code).json({
    success: true,
    message: 'Department created successfully',
    data: department
  });
});

/**
 * Update department
 * @route PUT /api/v1/departments/:id
 */
const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const departmentData = req.body;
  
  const department = await departmentService.updateDepartment(id, departmentData, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department updated successfully',
    data: department
  });
});

/**
 * Update department status
 * @route PATCH /api/v1/departments/:id/status
 */
const updateDepartmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  const { status } = req.body;
  
  const department = await departmentService.updateDepartmentStatus(id, status, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department status updated successfully',
    data: department
  });
});

/**
 * Assign department head
 * @route POST /api/v1/departments/:id/head/:userId
 */
const assignDepartmentHead = asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  objectId(id);
  objectId(userId);
  
  const department = await departmentService.assignDepartmentHead(id, userId, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department head assigned successfully',
    data: department
  });
});

/**
 * Delete department
 * @route DELETE /api/v1/departments/:id
 */
const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  await departmentService.deleteDepartment(id, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department deleted successfully'
  });
});

/**
 * Get sub-departments
 * @route GET /api/v1/departments/:id/sub-departments
 */
const getSubDepartments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  const subDepartments = await departmentService.getSubDepartments(id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Sub-departments retrieved successfully',
    data: subDepartments
  });
});

/**
 * Upload department logo
 * @route POST /api/v1/departments/:id/logo
 */
const uploadDepartmentLogo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  objectId(id);
  
  if (!req.file) {
    throw new Error('Logo file is required');
  }
  
  const logoData = {
    filename: req.file.filename,
    path: req.file.path.replace(`${process.cwd()}/src/uploads/`, ''),
    contentType: req.file.mimetype
  };
  
  const department = await departmentService.updateDepartment(id, {
    logo: logoData
  }, req.user.id);
  
  res.status(HTTP_STATUS.OK.code).json({
    success: true,
    message: 'Department logo uploaded successfully',
    data: {
      logo: department.logo
    }
  });
});

module.exports = {
  getDepartments,
  getDepartmentById,
  getDepartmentByCode,
  createDepartment,
  updateDepartment,
  updateDepartmentStatus,
  assignDepartmentHead,
  deleteDepartment,
  getSubDepartments,
  uploadDepartmentLogo
};