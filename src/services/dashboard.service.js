// src/services/dashboard.service.js
const UserRepository = require('../repositories/user.repository');
const CaseRepository = require('../repositories/case.repository');
const DocumentRepository = require('../repositories/document.repository');
const DepartmentRepository = require('../repositories/department.repository');
const LogRepository = require('../repositories/log.repository');
const { status: { CASE_STATUS, USER_STATUS } } = require('../constants');
const { objectId } = require('../utils/validation.utils');

class DashboardService {
  constructor() {
    this.userRepository = new UserRepository();
    this.caseRepository = new CaseRepository();
    this.documentRepository = new DocumentRepository();
    this.departmentRepository = new DepartmentRepository();
    this.logRepository = new LogRepository();
  }

  /**
   * Get system-wide statistics for super admin
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStats() {
    const [
      totalUsers,
      activeUsers,
      totalStaff,
      totalStudents,
      totalCases,
      activeCases,
      totalDocuments,
      totalDepartments
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ status: USER_STATUS.ACTIVE }),
      this.userRepository.count({ role: 'staff' }),
      this.userRepository.count({ role: 'student' }),
      this.caseRepository.count(),
      this.caseRepository.count({ status: { $in: [CASE_STATUS.SUBMITTED, CASE_STATUS.ASSIGNED, CASE_STATUS.IN_REVIEW] } }),
      this.documentRepository.count(),
      this.departmentRepository.count()
    ]);
    
    // Get case status distribution
    const caseStatusCounts = {};
    for (const status of Object.values(CASE_STATUS)) {
      caseStatusCounts[status] = await this.caseRepository.count({ status });
    }
    
    // Get recently active users (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    
    const recentlyActiveUsers = await this.logRepository.count({
      timestamp: { $gte: oneDayAgo }
    });
    
    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        staff: totalStaff,
        students: totalStudents,
        recentlyActive: recentlyActiveUsers
      },
      cases: {
        total: totalCases,
        active: activeCases,
        statusDistribution: caseStatusCounts
      },
      documents: {
        total: totalDocuments
      },
      departments: {
        total: totalDepartments
      }
    };
  }

  /**
   * Get department statistics for managers
   * @param {String} departmentId - Department ID
   * @returns {Promise<Object>} Department statistics
   */
  async getDepartmentStats(departmentId) {
    objectId(departmentId);
    
    const [
      totalStaff,
      totalStudents,
      totalCases,
      pendingCases,
      completedCases,
      totalDocuments
    ] = await Promise.all([
      this.userRepository.count({ role: 'staff', department: departmentId }),
      this.userRepository.count({ role: 'student', department: departmentId }),
      this.caseRepository.count({ department: departmentId }),
      this.caseRepository.count({ 
        department: departmentId,
        status: { $in: [CASE_STATUS.SUBMITTED, CASE_STATUS.ASSIGNED, CASE_STATUS.IN_REVIEW] }
      }),
      this.caseRepository.count({ 
        department: departmentId,
        status: CASE_STATUS.COMPLETED
      }),
      this.documentRepository.count({ 'metadata.department': departmentId })
    ]);
    
    // Get staff with assigned cases
    const staffWithAssignedCases = await this.caseRepository.findAll(
      { 
        department: departmentId,
        status: { $in: [CASE_STATUS.ASSIGNED, CASE_STATUS.IN_REVIEW] }
      },
      {
        populate: { path: 'assignedTo', select: 'email' }
      }
    );
    
    // Count cases by staff
    const casesByStaff = {};
    staffWithAssignedCases.forEach(case_ => {
      if (case_.assignedTo) {
        const staffId = case_.assignedTo._id.toString();
        const staffEmail = case_.assignedTo.email;
        
        if (!casesByStaff[staffId]) {
          casesByStaff[staffId] = {
            id: staffId,
            email: staffEmail,
            count: 0
          };
        }
        
        casesByStaff[staffId].count++;
      }
    });
    
    return {
      staff: {
        total: totalStaff,
        caseDistribution: Object.values(casesByStaff)
      },
      students: {
        total: totalStudents
      },
      cases: {
        total: totalCases,
        pending: pendingCases,
        completed: completedCases
      },
      documents: {
        total: totalDocuments
      }
    };
  }

  /**
   * Get staff dashboard statistics
   * @param {String} staffId - Staff ID
   * @returns {Promise<Object>} Staff statistics
   */
  async getStaffStats(staffId) {
    objectId(staffId);
    
    const [
      assignedCases,
      inReviewCases,
      completedCases,
      totalCases,
      recentCases
    ] = await Promise.all([
      this.caseRepository.count({ assignedTo: staffId, status: CASE_STATUS.ASSIGNED }),
      this.caseRepository.count({ assignedTo: staffId, status: CASE_STATUS.IN_REVIEW }),
      this.caseRepository.count({ assignedTo: staffId, status: CASE_STATUS.COMPLETED }),
      this.caseRepository.count({ assignedTo: staffId }),
      this.caseRepository.findAll(
        { assignedTo: staffId },
        {
          populate: { path: 'student', select: 'email' },
          sort: { updatedAt: -1 },
          limit: 5
        }
      )
    ]);
    
    return {
      cases: {
        assigned: assignedCases,
        inReview: inReviewCases,
        completed: completedCases,
        total: totalCases
      },
      recentCases: recentCases.map(case_ => ({
        id: case_._id,
        caseNumber: case_.caseNumber,
        title: case_.title,
        status: case_.status,
        student: case_.student ? case_.student.email : 'Unknown',
        updatedAt: case_.updatedAt
      }))
    };
  }

  /**
   * Get student dashboard statistics
   * @param {String} studentId - Student ID
   * @returns {Promise<Object>} Student statistics
   */
  async getStudentStats(studentId) {
    objectId(studentId);
    
    const [
      draftCases,
      submittedCases,
      revisionRequestedCases,
      completedCases,
      totalCases,
      recentCases
    ] = await Promise.all([
      this.caseRepository.count({ student: studentId, status: CASE_STATUS.DRAFT }),
      this.caseRepository.count({ 
        student: studentId, 
        status: { $in: [CASE_STATUS.SUBMITTED, CASE_STATUS.ASSIGNED, CASE_STATUS.IN_REVIEW] }
      }),
      this.caseRepository.count({ student: studentId, status: CASE_STATUS.REVISION_REQUESTED }),
      this.caseRepository.count({ student: studentId, status: CASE_STATUS.COMPLETED }),
      this.caseRepository.count({ student: studentId }),
      this.caseRepository.findAll(
        { student: studentId },
        {
          populate: { path: 'assignedTo', select: 'email' },
          sort: { updatedAt: -1 },
          limit: 5
        }
      )
    ]);
    
    // Calculate completion rate
    const completionRate = totalCases > 0 ? (completedCases / totalCases * 100).toFixed(1) : 0;
    
    return {
      cases: {
        draft: draftCases,
        submitted: submittedCases,
        revisionRequested: revisionRequestedCases,
        completed: completedCases,
        total: totalCases,
        completionRate
      },
      recentCases: recentCases.map(case_ => ({
        id: case_._id,
        caseNumber: case_.caseNumber,
        title: case_.title,
        status: case_.status,
        assignedTo: case_.assignedTo ? case_.assignedTo.email : 'Unassigned',
        updatedAt: case_.updatedAt
      }))
    };
  }

  /**
   * Get case completion statistics
   * @param {String} departmentId - Optional department ID filter
   * @returns {Promise<Object>} Case completion statistics
   */
  async getCaseCompletionStats(departmentId = null) {
    const filter = departmentId ? { department: departmentId } : {};
    
    // Get cases grouped by month
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const cases = await this.caseRepository.findAll(
      {
        ...filter,
        createdAt: { $gte: sixMonthsAgo }
      },
      {
        select: 'status createdAt workflowHistory'
      }
    );
    
    // Group by month
    const monthlyStats = {};
    
    cases.forEach(case_ => {
      const month = case_.createdAt.toISOString().substring(0, 7); // YYYY-MM format
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          total: 0,
          completed: 0,
          avgCompletionTime: 0,
          totalCompletionTime: 0
        };
      }
      
      monthlyStats[month].total++;
      
      if (case_.status === CASE_STATUS.COMPLETED) {
        monthlyStats[month].completed++;
        
        // Calculate completion time if workflow history available
        if (case_.workflowHistory && case_.workflowHistory.length > 0) {
          const submittedEvent = case_.workflowHistory.find(
            event => event.status === CASE_STATUS.SUBMITTED
          );
          
          const completedEvent = case_.workflowHistory.find(
            event => event.status === CASE_STATUS.COMPLETED
          );
          
          if (submittedEvent && completedEvent) {
            const submittedDate = new Date(submittedEvent.changedAt);
            const completedDate = new Date(completedEvent.changedAt);
            const completionTime = (completedDate - submittedDate) / (1000 * 60 * 60 * 24); // in days
            
            monthlyStats[month].totalCompletionTime += completionTime;
          }
        }
      }
    });
    
    // Calculate average completion time
    for (const month in monthlyStats) {
      if (monthlyStats[month].completed > 0) {
        monthlyStats[month].avgCompletionTime = 
          monthlyStats[month].totalCompletionTime / monthlyStats[month].completed;
      }
      
      delete monthlyStats[month].totalCompletionTime;
    }
    
    // Convert to array format for easier frontend consumption
    const result = Object.keys(monthlyStats).map(month => ({
      month,
      ...monthlyStats[month],
      completionRate: monthlyStats[month].total > 0 
        ? (monthlyStats[month].completed / monthlyStats[month].total * 100).toFixed(1)
        : 0
    }));
    
    // Sort by month
    result.sort((a, b) => a.month.localeCompare(b.month));
    
    return result;
  }

  /**
   * Get document usage statistics
   * @param {String} departmentId - Optional department ID filter
   * @returns {Promise<Object>} Document usage statistics
   */
  async getDocumentUsageStats(departmentId = null) {
    const filter = departmentId 
      ? { 'metadata.department': departmentId }
      : {};
    
    // Get documents with access logs
    const documents = await this.documentRepository.findAll(
      filter,
      {
        select: 'category title accessLogs createdAt'
      }
    );
    
    // Group by category
    const categoryStats = {};
    
    documents.forEach(doc => {
      const category = doc.category || 'Uncategorized';
      
      if (!categoryStats[category]) {
        categoryStats[category] = {
          total: 0,
          accessCount: 0,
          documents: []
        };
      }
      
      categoryStats[category].total++;
      
      const accessCount = doc.accessLogs ? doc.accessLogs.length : 0;
      categoryStats[category].accessCount += accessCount;
      
      categoryStats[category].documents.push({
        id: doc._id,
        title: doc.title,
        accessCount,
        createdAt: doc.createdAt
      });
    });
    
    // Calculate statistics
    const result = Object.keys(categoryStats).map(category => ({
      category,
      documentCount: categoryStats[category].total,
      totalAccesses: categoryStats[category].accessCount,
      avgAccessesPerDocument: categoryStats[category].total > 0
        ? (categoryStats[category].accessCount / categoryStats[category].total).toFixed(1)
        : 0,
      topDocuments: categoryStats[category].documents
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 5)
    }));
    
    return result;
  }
}

module.exports = new DashboardService();