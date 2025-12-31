import NodeCache from "node-cache";

// stdTTL - the standard ttl as number in seconds for every generated cache element. 
// checkperiod - The period in seconds, as a number, used for the automatic delete check interval.
const cache = new NodeCache({
  stdTTL: 100, // default TTL: 100 seconds
  checkperiod: 120, // check expired keys every 2 minutes
});

export default cache;

// HELPER
export const clearUserTodoCache = (userId, todoId = null) => {

    // Remove paginated caches
    cache.keys().forEach(key => {
        if (key.startsWith(`todos_${userId}_page_`)) {
            cache.del(key);
        }
    });

    // Remove single todo if provided
    if (todoId) {
        cache.del(`todo_${todoId}_user_${userId}`);
    }
};
