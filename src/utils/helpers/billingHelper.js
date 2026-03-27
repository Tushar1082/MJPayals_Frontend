/**
 * Billing Calculation Helper
 * Handles all item amount calculations with consistent rounding to avoid precision errors
 */

// ============================================================================
// CORE ROUNDING UTILITIES
// ============================================================================

/**
 * Round to specified decimal places
 * @param {number} num - Number to round
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {number} Rounded number
 */
export const roundTo = (num, decimals = 2) => {
  if (isNaN(num) || num === null || num === undefined) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round(num * multiplier) / multiplier;
};

/**
 * Round to nearest integer (for currency amounts)
 * @param {number} num - Number to round
 * @returns {number} Rounded integer
 */
export const roundToInt = (num) => {
  if (isNaN(num) || num === null || num === undefined) return 0;
  return Math.round(num);
};

/**
 * Custom Rounding:
 * - If the decimal part is .50 or greater -> Round up to the next integer (Math.ceil)
 * - If the decimal part is .49 or less -> Return the original value (No change)
 * * @param {number} num - The number to round
 * @returns {number} The rounded integer or the original number
 */
export const customRound = (num) => {
  if (isNaN(num) || num === null || num === undefined) return 0;
  
  // Convert the value to a string to avoid JavaScript floating-point precision issues
  const strValue = num.toString();
  const decimalIndex = strValue.indexOf('.');
  
  // If it is a whole integer (e.g., 2), return it as is
  if (decimalIndex === -1) return num;
  
  // Extract the first 2 digits after the decimal point (e.g., .5 becomes '50', .499 becomes '49')
  const decimalStr = strValue.substring(decimalIndex + 1, decimalIndex + 3).padEnd(2, '0');
  const firstTwoDecimals = parseInt(decimalStr, 10);
  
  // If the decimal part is 50 or greater, round up to the next whole number (ceil)
  if (firstTwoDecimals >= 50) {
      return Math.ceil(num); 
  } 
  // If the decimal part is 49 or less, return the original number unchanged
  else {
      return num; 
  }
};

// ============================================================================
// WEIGHT CALCULATIONS
// ============================================================================

/**
 * Calculate total polythene weight
 * @param {Array} ppRows - Array of polythene objects {count, weight}
 * @returns {number} Total polythene weight
 */
export const calculateTotalPP = (ppRows = []) => {
  const total = ppRows.reduce((sum, pp) => {
    const count = Number(pp.count) || 0;
    const weight = Number(pp.weight) || 0;
    return sum + (count * weight);
  }, 0);

  return roundTo(total, 2); // Keep 3 decimals for weight precision
};

/**
 * Calculate net weight (gross weight - polythene weight)
 * @param {number} grossWeight - Gross weight
 * @param {Array} ppRows - Array of polythene objects
 * @returns {number} Net weight
 */
export const calculateNetWeight = (grossWeight, ppRows = []) => {
  const gross = Number(grossWeight) || 0;
  const totalPP = calculateTotalPP(ppRows);
  const netWeight = Math.max(0, gross - totalPP);

  return roundTo(netWeight, 2); // Keep 3 decimals for weight precision
};

// ============================================================================
// LABOUR CALCULATIONS
// ============================================================================

/**
 * Calculate labour amount based on type
 * @param {string} labourType - 'P' (per piece), 'K' (per kg), 'G' (per gram)
 * @param {number} labourRate - Labour rate
 * @param {number} netWeight - Net weight in grams
 * @param {number} numPieces - Number of pieces (for type 'P')
 * @returns {number} Labour amount
 */
export const calculateLabourAmount = (labourType, labourRate, netWeight, numPieces = 0) => {
  const rate = Number(labourRate) || 0;
  const weight = Number(netWeight) || 0;
  const pieces = Number(numPieces) || 0;

  let labourAmount = 0;

  switch (labourType) {
    case 'P': // Per Piece
      labourAmount = rate * pieces;
      break;

    case 'K': // Per Kilogram
      labourAmount = (rate / 1000) * weight; // Convert weight to kg
      break;

    case 'G': // Per Gram
      labourAmount = rate * weight;
      break;

    default:
      labourAmount = 0;
  }

  return roundToInt(labourAmount);
};

// ============================================================================
// RETAIL CUSTOMER CALCULATIONS (cusType = 'R')
// ============================================================================

/**
 * Calculate item amount for RETAIL customer using rate per gram
 * Formula: rateGm × netWeight
 * 
 * @param {number} rateGm - Rate per gram
 * @param {number} netWeight - Net weight in grams
 * @returns {number} Item amount
 */
export const calculateRetailAmountByRateGm = (rateGm, netWeight) => {
  const rate = Number(rateGm) || 0;
  const weight = Number(netWeight) || 0;

  if (rate <= 0 || weight <= 0) return 0;

  const amount = rate * weight;
  return roundToInt(amount);
};

/**
 * Calculate item amount for RETAIL customer using rate percentage on silver
 * Formula: (ratePer% × silverRate) ÷ 1000 × netWeight
 * 
 * @param {number} ratePer - Rate percentage
 * @param {number} silverRate - Silver rate per kg
 * @param {number} netWeight - Net weight in grams
 * @returns {number} Item amount
 */
export const calculateRetailAmountByRatePer = (ratePer, silverRate, netWeight) => {
  const per = Number(ratePer) || 0;
  const silver = Number(silverRate) || 0;
  const weight = Number(netWeight) || 0;

  if (per <= 0 || silver <= 0 || weight <= 0) return 0;

  // Step 1: Apply rate percentage on silver rate
  const silverWithRate = (per / 100) * silver;

  // Step 2: Convert silver rate from per kg to per gram
  const silverPerGram = silverWithRate / 1000;

  // Step 3: Multiply by net weight
  const amount = silverPerGram * weight;

  return roundToInt(amount);
};

/**
 * Calculate total item amount for RETAIL customer
 * Automatically chooses between rateGm or ratePer method
 * 
 * @param {number} grossWeight - Gross weight
 * @param {Array} ppRows - Polythene rows
 * @param {number} rateGm - Rate per gram (optional)
 * @param {number} rateKg - Rate per kilogram (optional)
 * @param {number} ratePer - Rate percentage (optional)
 * @param {number} silverRate - Silver rate per kg (required if using ratePer)
 * @returns {number} Item amount
 */
export const calculateRetailItemAmount = (grossWeight, ppRows, rateGm, rateKg, ratePer, silverRate) => {
  const netWeight = calculateNetWeight(grossWeight, ppRows);

  // Priority 1: Use rateGm if available
  if (Number(rateGm) > 0) {
    return calculateRetailAmountByRateGm(rateGm, netWeight);
  }

  // Priority 2: Use rateKg if available
  if (Number(rateKg) > 0) {
    return calculateRetailAmountByRateKg(rateKg, netWeight);
  }

  // Priority 3: Use ratePer if available
  if (Number(ratePer) > 0 && Number(silverRate) > 0) {
    return calculateRetailAmountByRatePer(ratePer, silverRate, netWeight);
  }

  return 0;
};

// ============================================================================
// RATE PER KILOGRAM CALCULATIONS
// ============================================================================

/**
 * Calculate item amount for RETAIL customer using rate per kilogram
 * Formula: (rateKg / 1000) × netWeight
 * 
 * @param {number} rateKg - Rate per kilogram
 * @param {number} netWeight - Net weight in grams
 * @returns {number} Item amount
 */
export const calculateRetailAmountByRateKg = (rateKg, netWeight) => {
  const rate = Number(rateKg) || 0;
  const weight = Number(netWeight) || 0;

  if (rate <= 0 || weight <= 0) return 0;

  // Convert rate per kg to rate per gram
  const ratePerGram = rate / 1000;
  const amount = ratePerGram * weight;

  return roundToInt(amount);
};

/**
 * Calculate item amount for WHOLESALE customer using rate per kilogram
 * Formula: ((rateKg / 1000) × netWeight) + labourAmount
 * 
 * @param {number} rateKg - Rate per kilogram
 * @param {number} netWeight - Net weight in grams
 * @param {number} labourAmount - Pre-calculated labour amount
 * @returns {number} Item amount
 */
export const calculateWholesaleAmountByRateKg = (rateKg, netWeight, labourAmount = 0) => {
  const rate = Number(rateKg) || 0;
  const weight = Number(netWeight) || 0;
  const labour = Number(labourAmount) || 0;

  if (rate <= 0 || weight <= 0) return roundToInt(labour);

  // Convert rate per kg to rate per gram
  const ratePerGram = rate / 1000;
  const silverAmount = ratePerGram * weight;
  const totalAmount = silverAmount + labour;

  return roundToInt(totalAmount);
};

// ============================================================================
// WHOLESALE CUSTOMER CALCULATIONS (cusType = 'W')
// ============================================================================

/**
 * Calculate item amount for WHOLESALE customer using rate per gram
 * Formula: (rateGm × netWeight) + labourAmount
 * 
 * @param {number} rateGm - Rate per gram
 * @param {number} netWeight - Net weight in grams
 * @param {number} labourAmount - Pre-calculated labour amount
 * @returns {number} Item amount
 */
export const calculateWholesaleAmountByRateGm = (rateGm, netWeight, labourAmount = 0) => {
  const rate = Number(rateGm) || 0;
  const weight = Number(netWeight) || 0;
  const labour = Number(labourAmount) || 0;

  if (rate <= 0 || weight <= 0) return roundToInt(labour);

  const silverAmount = rate * weight;
  const totalAmount = silverAmount + labour;

  return roundToInt(totalAmount);
};

/**
 * Calculate item amount for WHOLESALE customer using rate percentage
 * Formula: (fine × silverRatePerGram) + labourAmount
 * where fine = netWeight × (ratePer / 100)
 * 
 * @param {number} ratePer - Rate percentage
 * @param {number} silverRate - Silver rate per kg
 * @param {number} netWeight - Net weight in grams
 * @param {number} labourAmount - Pre-calculated labour amount
 * @returns {number} Item amount
 */
export const calculateWholesaleAmountByRatePer = (ratePer, silverRate, netWeight, labourAmount = 0) => {
  const per = Number(ratePer) || 0;
  const silver = Number(silverRate) || 0;
  const weight = Number(netWeight) || 0;
  const labour = Number(labourAmount) || 0;

  if (per <= 0 || silver <= 0 || weight <= 0) return roundToInt(labour);

  // Step 1: Calculate fine (apply rate percentage on net weight)
  // const fine = weight * (per / 100);
  const fine = roundTo(weight * (per / 100), 2);

  // Step 2: Convert silver rate from per kg to per gram
  const silverPerGram = silver / 1000;

  // Step 3: Calculate silver amount and add labour
  const silverAmount = fine * silverPerGram;
  const totalAmount = silverAmount + labour;

  return roundToInt(totalAmount);
};

/**
 * Calculate total item amount for WHOLESALE customer
 * Automatically chooses between rateGm or ratePer method and includes labour
 * 
 * @param {number} grossWeight - Gross weight
 * @param {Array} ppRows - Polythene rows
 * @param {number} rateGm - Rate per gram (optional)
 * @param {number} rateKg - Rate per kilogram (optional)
 * @param {number} ratePer - Rate percentage (optional)
 * @param {number} silverRate - Silver rate per kg (required if using ratePer)
 * @param {string} labourType - Labour type ('P', 'K', 'G')
 * @param {number} labourRate - Labour rate
 * @param {number} labourNumPieces - Number of pieces (for type 'P')
 * @returns {object} {amount, labourAmount}
 */
export const calculateWholesaleItemAmount = (
  grossWeight,
  ppRows,
  rateGm,
  rateKg,
  ratePer,
  silverRate,
  labourType,
  labourRate,
  labourNumPieces
) => {
  const netWeight = calculateNetWeight(grossWeight, ppRows);

  // Calculate labour first
  const labourAmount = calculateLabourAmount(labourType, labourRate, netWeight, labourNumPieces);

  let amount = 0;

  // Priority 1: Use rateGm if available
  if (Number(rateGm) > 0) {
    amount = calculateWholesaleAmountByRateGm(rateGm, netWeight, labourAmount);
  }
  // Priority 2: Use rateKg if available
  else if (Number(rateKg) > 0) {
    amount = calculateWholesaleAmountByRateKg(rateKg, netWeight, labourAmount);
  }
  // Priority 3: Use ratePer if available
  else if (Number(ratePer) > 0 && Number(silverRate) > 0) {
    amount = calculateWholesaleAmountByRatePer(ratePer, silverRate, netWeight, labourAmount);
  }
  // No rate specified, only labour
  else {
    amount = labourAmount;
  }

  return {
    amount,
    labourAmount
  };
};

// ============================================================================
// UNIFIED CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate item amount based on customer type
 * Main function to use in transformItemsForBackend
 * 
 * @param {string} cusType - Customer type ('R' for Retail, 'W' for Wholesale)
 * @param {object} params - Calculation parameters
 * @returns {object} {amount, labourAmount, netWeight}
 */
export const calculateItemAmount = (cusType, params) => {
  const {
    grossWeight,
    ppRows = [],
    rateGm,
    rateKg,
    ratePer,
    silverRate,
    labourType,
    labourRate,
    labourNumPieces
  } = params;

  const netWeight = calculateNetWeight(grossWeight, ppRows);

  if (cusType === 'R') {
    // RETAIL CUSTOMER
    const amount = calculateRetailItemAmount(grossWeight, ppRows, rateGm, rateKg, ratePer, silverRate);
    return {
      amount,
      labourAmount: 0, // Retail doesn't use labour
      netWeight
    };
  }
  else if (cusType === 'W') {
    // WHOLESALE CUSTOMER
    const { amount, labourAmount } = calculateWholesaleItemAmount(
      grossWeight,
      ppRows,
      rateGm,
      rateKg,
      ratePer,
      silverRate,
      labourType,
      labourRate,
      labourNumPieces
    );
    return {
      amount,
      labourAmount,
      netWeight
    };
  }

  // Unknown customer type
  return {
    amount: 0,
    labourAmount: 0,
    netWeight
  };
};

// ============================================================================
// POLYTHENE TRANSFORMATION HELPER
// ============================================================================

/**
 * Transform ppRows - swap count and weight if count is decimal
 * @param {Array} ppRows - Array of polythene objects
 * @returns {Array} Transformed ppRows
 */
export const transformPPRows = (ppRows = []) => {
  return ppRows.map((pp) => {
    const count = Number(pp.count) || 0;
    const weight = Number(pp.weight) || 0;

    // If count is decimal, swap with weight
    const isDecimal = count % 1 !== 0;

    if (isDecimal) {
      return {
        count: weight,
        weight: count
      };
    }

    return {
      count,
      weight
    };
  });
};

/**
 * Convert ppRows to polythenes array format for backend
 * @param {Array} ppRows - Transformed ppRows
 * @returns {Array} Polythenes array
 */
export const formatPolythenes = (ppRows = []) => {
  return ppRows
    .filter((pp) => Number(pp.count) > 0 && Number(pp.weight) > 0)
    .map((pp) => ({
      noOfPPs: Number(pp.count),
      weight: Number(pp.weight)
    }));
};


// ============================================================================
// GRAND TOTAL CALCULATION (WHOLESALE)
// ============================================================================

/**
 * Calculate Wholesale Net Amount by summing components first
 * This ensures the PDF total matches the calculated net amount exactly.
 */
export const calculateWholesaleGrandTotal = (items = [], silverRate = 0) => {
    let totalSellFine = 0;
    let totalPurchaseFine = 0;

    let totalSellOtherAmount = 0;
    let totalPurchaseOtherAmount = 0;

    let totalSellLabour = 0;
    let totalPurchaseLabour = 0;

    items.forEach(item => {
        const grossWeight = Number(item.weight) || 0;
        const netWeight = calculateNetWeight(grossWeight, item.ppRows);

        // 1. Calculate Labour Amount for the item
        const labourAmount = calculateLabourAmount(
            item.labourType,
            item.labourRate,
            netWeight,
            item.labourNumPieces
        );

        let fine = 0;
        let otherAmount = 0;

        if (Number(item.ratePer) > 0) {
            // Find Fine (Rate %)
            fine = roundTo(netWeight * (Number(item.ratePer) / 100), 2);
            
        } else if (Number(item.rateGm) > 0) {
            // Find Amount directly using Rate / Gram
            otherAmount = netWeight * Number(item.rateGm);
            
        } else if (Number(item.rateKg) > 0) {
            // Convert Rate / KG into Rate / Gram, then multiply
            const ratePerGram = Number(item.rateKg) / 1000;
            otherAmount = netWeight * ratePerGram;
        }

        // Distribute into Sell and Purchase buckets
        if (item.itemType === 'S') {
            totalSellFine += fine;
            totalSellOtherAmount += otherAmount;
            totalSellLabour += labourAmount;
            
        } else if (item.itemType === 'P') {
            totalPurchaseFine += fine;
            totalPurchaseOtherAmount += otherAmount;
            totalPurchaseLabour += labourAmount;
        }
    });

    // --- STEP A: Calculate Fine Amount ---
    // Total Fine = (Sell Fine - Purchase Fine) * (Silver Rate / 1000)
    const netFine = customRound(totalSellFine) - customRound(totalPurchaseFine);
    const fineAmount = customRound(netFine) * (Number(silverRate) / 1000);

    // --- STEP B: Calculate Other Rates Amount (Rate/G and Rate/KG) ---
    const netOtherAmount = totalSellOtherAmount - totalPurchaseOtherAmount;

    // --- STEP C: Calculate Labour Amount ---
    const netLabourAmount = totalSellLabour - totalPurchaseLabour;

    // --- FINAL STEP: Sum everything up ---
    const grandTotalAmount = fineAmount + netOtherAmount + netLabourAmount;

    // Return the final rounded integer
    return roundToInt(grandTotalAmount);
};