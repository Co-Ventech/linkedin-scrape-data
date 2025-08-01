/**
 * Removes batches older than specified days from the database
 * @param {Object} model - Mongoose model (UserJobBatch or UpworkUserJobBatch)
 * @param {number} daysOld - Number of days after which data should be deleted (default: 7)
 * @returns {Promise<Object>} - Result of cleanup operation
 */
const cleanupOldBatches = async (model, daysOld = 7) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    console.log(`Cleaning up batches older than ${daysOld} days (before ${cutoffDate.toISOString()})`);
    
    // Find all users with batches
    const usersWithBatches = await model.find({});
    let totalBatchesRemoved = 0;
    let totalUsersProcessed = 0;
    
    for (const userBatch of usersWithBatches) {
      const originalBatchCount = userBatch.batches.length;
      
      // Filter out batches older than the cutoff date
      userBatch.batches = userBatch.batches.filter(batch => {
        const batchDate = new Date(batch.timestamp);
        return batchDate >= cutoffDate;
      });
      
      const batchesRemoved = originalBatchCount - userBatch.batches.length;
      
      if (batchesRemoved > 0) {
        await userBatch.save();
        totalBatchesRemoved += batchesRemoved;
        console.log(`User ${userBatch.userId}: Removed ${batchesRemoved} old batches`);
      }
      
      totalUsersProcessed++;
    }
    
    console.log(`Cleanup completed: ${totalBatchesRemoved} batches removed from ${totalUsersProcessed} users`);
    
    return {
      success: true,
      totalBatchesRemoved,
      totalUsersProcessed,
      cutoffDate: cutoffDate.toISOString()
    };
    
  } catch (error) {
    console.error('Error during data cleanup:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = { cleanupOldBatches };