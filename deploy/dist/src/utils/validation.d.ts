interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
interface ValidationRule {
    field: string;
    type: string;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
}
export declare function validateDto(dtoClass: any, data: any): ValidationResult;
export declare function addValidationRules(dtoName: string, rules: ValidationRule[]): void;
export declare function validateField(value: any, rule: ValidationRule): string[];
export {};
