const { Op } = require("sequelize");

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return parsed;
};

const buildPagination = ({ page = 1, limit = 10, totalItems = 0 }) => {
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

const buildPublicCourseWhereClause = ({ category, level, search }) => {
  const whereClause = { status: "PUBLISHED", isActive: true };
  if (category) whereClause.category = category;
  if (level) whereClause.level = level;
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
    ];
  }
  return whereClause;
};

const buildCourseSearchWhereClause = ({ q, category, level, minPrice, maxPrice }) => {
  const whereClause = { status: "PUBLISHED", isActive: true };
  if (category) whereClause.category = category;
  if (level) whereClause.level = level;
  if (minPrice !== undefined) whereClause.price = { [Op.gte]: minPrice };
  if (maxPrice !== undefined) whereClause.price = { [Op.lte]: maxPrice };
  if (q) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${q}%` } },
      { description: { [Op.iLike]: `%${q}%` } },
      { tags: { [Op.contains]: [q] } },
    ];
  }
  return whereClause;
};

const buildSearchOrderClause = ({ sortBy = "relevance", q }) => {
  if (sortBy === "relevance" && q) {
    return [
      [Op.literal(`CASE WHEN title ILIKE '%${q}%' THEN 1 ELSE 2 END`)],
      ["rating", "DESC"],
      ["enrollmentCount", "DESC"],
    ];
  }
  return [[sortBy, "DESC"]];
};

const buildInstructorCourseWhereClause = ({ instructorId, status }) => {
  const whereClause = { fk_instructor_id: instructorId };
  if (status) whereClause.status = status;
  return whereClause;
};

module.exports = {
  buildPagination,
  buildPublicCourseWhereClause,
  buildCourseSearchWhereClause,
  buildSearchOrderClause,
  buildInstructorCourseWhereClause,
};
