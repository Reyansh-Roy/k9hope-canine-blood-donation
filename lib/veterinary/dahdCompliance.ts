/**
 * K9Hope Veterinary Compliance Engine
 * Implements DAHD July 2025 SOP for Canine Blood Donation
 * 
 * @author RIT Chennai CSE Department
 * @medical_partner Madras Veterinary College, Vepery
 */

export interface CanineDonorEligibility {
    weight_kg: number;
    age_years: number;
    pcv_percentage: number;
    last_donation_date: Date | null;
    has_medical_conditions: boolean;
    species: "canine";
}

export function checkDAHD2025Eligibility(donor: CanineDonorEligibility): {
    eligible: boolean;
    reasons: string[];
    next_eligible_date: Date | null;
} {
    const reasons: string[] = [];
    let eligible = true;

    // DAHD Requirement 1: Minimum Weight
    if (donor.weight_kg < 25) {
        eligible = false;
        reasons.push("Weight below 25kg (DAHD 2025 minimum)");
    }

    // DAHD Requirement 2: Age Range
    if (donor.age_years < 1 || donor.age_years > 8) {
        eligible = false;
        reasons.push("Age outside 1-8 years range (DAHD 2025 protocol)");
    }

    // DAHD Requirement 3: PCV Level
    if (donor.pcv_percentage < 35) {
        eligible = false;
        reasons.push("PCV below 35% (DAHD 2025 threshold)");
    }

    // DAHD Requirement 4: 30-Day Cooldown
    let next_eligible_date = null;
    if (donor.last_donation_date) {
        const daysSince = Math.floor(
            (Date.now() - donor.last_donation_date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSince < 30) {
            eligible = false;
            next_eligible_date = new Date(
                donor.last_donation_date.getTime() + (30 * 24 * 60 * 60 * 1000)
            );
            reasons.push(`Must wait ${30 - daysSince} more days (DAHD 30-day cooldown)`);
        }
    }

    // DAHD Requirement 5: No Active Medical Conditions
    if (donor.has_medical_conditions) {
        eligible = false;
        reasons.push("Active medical condition detected (DAHD safety protocol)");
    }

    return { eligible, reasons, next_eligible_date };
}
