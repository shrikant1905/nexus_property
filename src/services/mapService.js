// ==========================================
// Google Maps API Service Setup
// ==========================================
// INSTRUCTIONS FOR DEVELOPER:
// 1. Paste your Google Maps API Key below.
// 2. Make sure you have enabled "Distance Matrix API" and "Geocoding API" in your Google Cloud Console.
// ==========================================

const GOOGLE_MAPS_API_KEY = ''; // <-- PASTE YOUR API KEY HERE

export const mapService = {
  /**
   * Fetches the distance and drive time between an origin (Job Address)
   * and multiple destinations (Staff locations/other jobs).
   * 
   * @param {string} originAddress - The address of the new work order.
   * @param {Array<string>} destinationAddresses - Array of addresses for the technicians.
   * @returns {Promise<Array>} Array of distance/duration objects for each destination.
   */
  async getDistanceMatrix(originAddress, destinationAddresses) {
    if (!GOOGLE_MAPS_API_KEY) {
      console.warn("Google Maps API Key is missing. Returning mock smart suggestion data.");
      // Return mock data if API key is not yet provided
      return destinationAddresses.map(() => ({
        distance: { text: `${(Math.random() * 10).toFixed(1)} mi`, value: Math.random() * 16000 },
        duration: { text: `${Math.floor(Math.random() * 30 + 15)} mins`, value: Math.random() * 2000 },
        status: 'OK'
      }));
    }

    try {
      // Note: Hitting Google Maps Distance API directly from frontend might require a CORS proxy 
      // or using the Google Maps JavaScript API (new google.maps.DistanceMatrixService()).
      // For standard REST calls, we use the URL below:
      const origins = encodeURIComponent(originAddress);
      const destinations = destinationAddresses.map(addr => encodeURIComponent(addr)).join('|');
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origins}&destinations=${destinations}&units=imperial&key=${GOOGLE_MAPS_API_KEY}`
      );
      
      const data = await response.json();
      
      if (data.status !== 'OK') {
        throw new Error(`Google Maps API Error: ${data.status}`);
      }

      // Return the results array which maps 1:1 with the destinationAddresses array
      return data.rows[0].elements;
      
    } catch (error) {
      console.error("Error fetching Distance Matrix:", error);
      throw error;
    }
  },

  /**
   * Calculates the best staff member to assign based on shortest drive time.
   * 
   * @param {string} jobAddress - The current job's address
   * @param {Array<Object>} staffList - List of available staff members
   * @returns {Promise<Object>} The recommended staff member and time saved
   */
  async getSmartSuggestion(jobAddress, staffList) {
    if (!jobAddress || !staffList || staffList.length === 0) return null;

    // In a real scenario, you would use the staff's CURRENT location or their NEXT JOB's location.
    // For this setup, we simulate their locations by passing mock destination addresses.
    const mockStaffLocations = staffList.map(s => `${s.name} current location, City`); 
    
    try {
      const distances = await this.getDistanceMatrix(jobAddress, mockStaffLocations);
      
      // Find the staff with the minimum duration (shortest drive time)
      let bestMatch = null;
      let minDurationValue = Infinity;

      distances.forEach((element, index) => {
        if (element.status === 'OK' && element.duration.value < minDurationValue) {
          minDurationValue = element.duration.value;
          bestMatch = {
            staff: staffList[index],
            driveTimeText: element.duration.text,
            distanceText: element.distance.text
          };
        }
      });

      return bestMatch;
    } catch (err) {
      console.error("Failed to calculate smart suggestion", err);
      return null;
    }
  }
};
