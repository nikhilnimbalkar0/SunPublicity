/**
 * Normalizes availability field from Firestore data
 * Handles multiple field name variations and data types
 * 
 * @param {Object} data - Firestore document data
 * @returns {boolean} - Normalized availability status
 */
export function normalizeAvailability(data) {
    // List of possible field names (case-sensitive)
    const possibleFields = ['available', 'Available', 'availability', 'Availability', 'isAvailable'];

    // Check each possible field name
    for (const field of possibleFields) {
        if (data[field] !== undefined && data[field] !== null) {
            const value = data[field];

            // Handle boolean values
            if (typeof value === 'boolean') {
                return value;
            }

            // Handle string values
            if (typeof value === 'string') {
                const lowerValue = value.toLowerCase().trim();
                return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1';
            }

            // Handle number values (1 = true, 0 = false)
            if (typeof value === 'number') {
                return value === 1;
            }
        }
    }

    // Default to false if no availability field found
    return false;
}

/**
 * Normalizes hoarding data from Firestore
 * 
 * @param {Object} docData - Raw Firestore document data
 * @param {string} docId - Document ID
 * @param {string} categoryName - Category name
 * @returns {Object|null} - Normalized hoarding object or null if invalid
 */
export function normalizeHoardingData(docData, docId, categoryName) {
    // Parse coordinates
    const lat = parseFloat(docData.latitude);
    const lng = parseFloat(docData.longitude);

    // Validate coordinates
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return null;
    }

    // Return normalized hoarding object
    return {
        id: docId,
        name: docData.category || categoryName,
        categoryName: categoryName,
        lat,
        lng,
        price: docData.price || "",
        imageUrl: docData.imageUrl || "",
        locationAddress: docData.location || "",
        size: docData.size || "",
        available: normalizeAvailability(docData), // Normalized boolean
    };
}
