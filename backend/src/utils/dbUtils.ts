import mongoose from "mongoose";
import logger from "./logger.js";

/**
 * Executes a callback within a MongoDB transaction.
 * Automatically retries the transaction if a transient transaction error (e.g. WriteConflict) is encountered.
 * 
 * @param callback The function to execute inside the transaction session
 * @param maxAttempts Maximum retry attempts before throwing
 * @param initialDelayMs Base delay for exponential backoff
 */
export const runTransactionWithRetry = async <T>(
  callback: (session: mongoose.ClientSession) => Promise<T>,
  maxAttempts = 5,
  initialDelayMs = 100
): Promise<T> => {
  let attempt = 0;

  while (true) {
    attempt++;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error: any) {
      try {
        await session.abortTransaction();
      } catch (abortErr: any) {
        logger.error(`Error aborting transaction: ${abortErr.message}`);
      }

      const isTransient =
        error.errorLabels?.includes("TransientTransactionError") ||
        error.errorLabels?.includes("UnknownTransactionCommitResult") ||
        error.code === 112; // MongoDB WriteConflict code

      if (isTransient && attempt < maxAttempts) {
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        logger.warn(
          `⚠️ Transaction transient error detected (Code: ${error.code}, Message: ${error.message}). Retrying transaction (attempt ${attempt}/${maxAttempts}) in ${delay}ms...`
        );
        session.endSession();
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        logger.error(
          `❌ Transaction failed completely (attempts: ${attempt}/${maxAttempts}). Error: ${error.message}`
        );
        session.endSession();
        throw error;
      }
    } finally {
      // In case session was not closed in the catch block retry branch
      if (!session.hasEnded) {
        session.endSession();
      }
    }
  }
};
