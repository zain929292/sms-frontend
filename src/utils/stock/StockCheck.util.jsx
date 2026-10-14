/**
 * @file stockUtils.js
 * @module Utils/StockUtils
 * @description Utility functions for checking and managing medicine stock.
 */

/**
 * Check if there's sufficient stock for a sale
 * @param {Array} medicines - List of all medicines
 * @param {Array} items - Sale items to check
 * @returns {Object} - { hasStock: boolean, insufficientItems: Array }
 */
export const checkStockAvailability = (medicines, items) => {
  const insufficientItems = [];

  items.forEach((item) => {
    const medicine = medicines.find(
      (m) => (m.id || m._id) === item.medicine_id,
    );
    if (medicine) {
      const availableStock = medicine.stock || 0;
      const requestedQuantity = item.quantity || 0;

      if (requestedQuantity > availableStock) {
        insufficientItems.push({
          medicine_id: medicine.id,
          medicine_name: medicine.name,
          available: availableStock,
          requested: requestedQuantity,
          shortage: requestedQuantity - availableStock,
        });
      }
    }
  });

  return {
    hasStock: insufficientItems.length === 0,
    insufficientItems,
  };
};

/**
 * Format stock error messages
 * @param {Array} insufficientItems - List of insufficient stock items
 * @returns {string} - Formatted error message
 */
export const formatStockErrorMessage = (insufficientItems) => {
  if (insufficientItems.length === 0) return "";

  const messages = insufficientItems.map(
    (item) =>
      `${item.medicine_name}: Available ${item.available}, Requested ${item.requested} (Shortage: ${item.shortage})`,
  );

  return `Insufficient stock:\n${messages.join("\n")}`;
};
