
// K9Hope-Specific: DEA Blood Type System
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Droplet } from "lucide-react";

export const DEA_BLOOD_TYPES = [
    { value: "DEA_1.1_positive", label: "DEA 1.1 Positive", universal: false },
    { value: "DEA_1.1_negative", label: "DEA 1.1 Negative (Universal Donor)", universal: true },
    { value: "DEA_1.2_positive", label: "DEA 1.2 Positive", universal: false },
    { value: "DEA_1.2_negative", label: "DEA 1.2 Negative", universal: false },
    { value: "DEA_3", label: "DEA 3", universal: false },
    { value: "DEA_4", label: "DEA 4", universal: false },
    { value: "DEA_5", label: "DEA 5", universal: false },
    { value: "DEA_7", label: "DEA 7", universal: false },
] as const;

export function DEABloodTypeSelector({ value, onValueChange }: { value?: string; onValueChange?: (value: string) => void }) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="border-2 border-red-500">
                <SelectValue placeholder="Select DEA Blood Type" />
            </SelectTrigger>
            <SelectContent>
                {DEA_BLOOD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-red-600" />
                            {type.label}
                            {type.universal && (
                                <Badge className="bg-green-500 text-xs text-white">Universal</Badge>
                            )}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
