/**
 * K9Hope Geospatial Matching Algorithm
 * Uses Haversine Formula for canine donor-patient distance calculation
 * 
 * @author RIT Chennai CSE
 */

export function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}

export function findNearbyCanineDonors(
    patientLat: number,
    patientLon: number,
    donors: any[],
    maxDistance: number = 10 // K9Hope default: 10km radius
): any[] {
    return donors
        .map(donor => ({
            ...donor,
            distance_km: calculateHaversineDistance(
                patientLat,
                patientLon,
                donor.d_latitude,
                donor.d_longitude
            ),
        }))
        .filter(donor => donor.distance_km <= maxDistance)
        .sort((a, b) => a.distance_km - b.distance_km); // Nearest first
}
