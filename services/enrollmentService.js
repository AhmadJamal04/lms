const ACTIVE_STATUS = "ACTIVE";

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const buildStatusWhereClause = ({ userId, status = ACTIVE_STATUS }) => {
  const whereClause = {};
  if (userId) whereClause.userId = userId;
  if (status && status !== "ALL") whereClause.status = status;
  return whereClause;
};

const buildPaginationMeta = ({ page = 1, limit = 10, totalItems = 0 }) => {
  const safePage = parsePositiveInt(page, 1);
  const safeLimit = parsePositiveInt(limit, 10);
  return {
    currentPage: safePage,
    totalPages: Math.ceil(totalItems / safeLimit),
    totalItems,
    itemsPerPage: safeLimit,
    offset: (safePage - 1) * safeLimit,
    limit: safeLimit,
  };
};

const calculateProgress = ({ completedModules = 0, totalModules = 0 }) => {
  if (!totalModules || totalModules <= 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
};

const buildProgressUpdateData = ({ completedModules, lastAccessed, totalModules }) => {
  const updateData = {};
  if (completedModules !== undefined) {
    updateData.completedModules = completedModules;
    updateData.progress = calculateProgress({ completedModules, totalModules });
    if (totalModules > 0 && completedModules >= totalModules) {
      updateData.status = "COMPLETED";
      updateData.completedAt = new Date();
    }
  }

  if (lastAccessed) {
    updateData.lastAccessed = new Date(lastAccessed);
  }

  return updateData;
};

module.exports = {
  ACTIVE_STATUS,
  parsePositiveInt,
  buildStatusWhereClause,
  buildPaginationMeta,
  calculateProgress,
  buildProgressUpdateData,
};
