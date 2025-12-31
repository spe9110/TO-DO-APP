export const cursorPaginatedResults = (model) => {
  return async (req, res, next) => {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 9, 50);
      const rawCursor = req.query.cursor;
      const cursor =
        rawCursor !== undefined &&
        rawCursor !== null &&
        rawCursor !== "null" &&
        !Number.isNaN(Number(rawCursor))
          ? Number(rawCursor)
          : null;

      let query = { userId: req.user.id };

      if (cursor !== null) {
        query.order = { $gt: cursor };
      }

      const results = await model
        .find(query)
        .sort({ order: 1 })
        // .sort({ createdAt: -1 }) // newest first
        .limit(limit + 1);       // +1 to check if more

      const hasMore = results.length > limit;

      const data = hasMore ? results.slice(0, limit) : results;

      // const nextCursor = hasMore
      //   ? data[data.length - 1].createdAt.toISOString()
      //   : null;
      const nextCursor = hasMore
        ? data[data.length - 1].order
        : null;

      res.paginatedResults = {
        data,
        nextCursor,
        total: await model.countDocuments({ userId: req.user.id }),
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  };
};
