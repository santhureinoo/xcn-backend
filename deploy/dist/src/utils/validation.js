"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
exports.addValidationRules = addValidationRules;
exports.validateField = validateField;
const validationRules = {
    CreateRegionGameVendorDto: [
        { field: 'region', type: 'string', required: true, minLength: 1 },
        { field: 'gameName', type: 'string', required: true, minLength: 1 },
        { field: 'vendorName', type: 'string', required: true, minLength: 1 },
        { field: 'isActive', type: 'boolean', required: false }
    ],
    UpdateRegionGameVendorDto: [
        { field: 'region', type: 'string', required: false, minLength: 1 },
        { field: 'gameName', type: 'string', required: false, minLength: 1 },
        { field: 'vendorName', type: 'string', required: false, minLength: 1 },
        { field: 'isActive', type: 'boolean', required: false }
    ]
};
function validateDto(dtoClass, data) {
    const errors = [];
    const dtoName = dtoClass.name || dtoClass.constructor?.name || 'Unknown';
    if (!data || typeof data !== 'object') {
        return {
            isValid: false,
            errors: ['Request body must be a valid object']
        };
    }
    const rules = validationRules[dtoName];
    if (!rules) {
        return { isValid: true, errors: [] };
    }
    for (const rule of rules) {
        const value = data[rule.field];
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push(`${rule.field} is required`);
            continue;
        }
        if (!rule.required && (value === undefined || value === null)) {
            continue;
        }
        if (value !== undefined && value !== null) {
            switch (rule.type) {
                case 'string':
                    if (typeof value !== 'string') {
                        errors.push(`${rule.field} must be a string`);
                    }
                    else {
                        if (rule.minLength && value.length < rule.minLength) {
                            errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
                        }
                        if (rule.maxLength && value.length > rule.maxLength) {
                            errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
                        }
                        if (rule.pattern && !rule.pattern.test(value)) {
                            errors.push(`${rule.field} format is invalid`);
                        }
                    }
                    break;
                case 'number':
                    if (typeof value !== 'number' || isNaN(value)) {
                        errors.push(`${rule.field} must be a valid number`);
                    }
                    break;
                case 'boolean':
                    if (typeof value !== 'boolean') {
                        errors.push(`${rule.field} must be a boolean`);
                    }
                    break;
                case 'array':
                    if (!Array.isArray(value)) {
                        errors.push(`${rule.field} must be an array`);
                    }
                    break;
                default:
                    break;
            }
        }
    }
    const allowedFields = rules.map(rule => rule.field);
    const providedFields = Object.keys(data);
    const unexpectedFields = providedFields.filter(field => !allowedFields.includes(field));
    if (unexpectedFields.length > 0) {
        errors.push(`Unexpected fields: ${unexpectedFields.join(', ')}`);
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function addValidationRules(dtoName, rules) {
    validationRules[dtoName] = rules;
}
function validateField(value, rule) {
    const errors = [];
    if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        return errors;
    }
    if (value === undefined || value === null) {
        return errors;
    }
    switch (rule.type) {
        case 'string':
            if (typeof value !== 'string') {
                errors.push(`${rule.field} must be a string`);
            }
            else {
                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
                }
                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
                }
                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${rule.field} format is invalid`);
                }
            }
            break;
        case 'number':
            if (typeof value !== 'number' || isNaN(value)) {
                errors.push(`${rule.field} must be a valid number`);
            }
            break;
        case 'boolean':
            if (typeof value !== 'boolean') {
                errors.push(`${rule.field} must be a boolean`);
            }
            break;
        case 'array':
            if (!Array.isArray(value)) {
                errors.push(`${rule.field} must be an array`);
            }
            break;
    }
    return errors;
}
//# sourceMappingURL=validation.js.map