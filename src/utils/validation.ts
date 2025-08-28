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
  
  // Define validation rules for each DTO
  const validationRules: { [key: string]: ValidationRule[] } = {
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
  
  export function validateDto(dtoClass: any, data: any): ValidationResult {
    const errors: string[] = [];
    const dtoName = dtoClass.name || dtoClass.constructor?.name || 'Unknown';
    
    if (!data || typeof data !== 'object') {
      return {
        isValid: false,
        errors: ['Request body must be a valid object']
      };
    }
  
    const rules = validationRules[dtoName];
    if (!rules) {
      // If no specific rules defined, perform basic validation
      return { isValid: true, errors: [] };
    }
  
    // Check each validation rule
    for (const rule of rules) {
      const value = data[rule.field];
  
      // Check required fields
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(`${rule.field} is required`);
        continue;
      }
  
      // Skip validation for optional fields that are not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }
  
      // Type validation
      if (value !== undefined && value !== null) {
        switch (rule.type) {
          case 'string':
            if (typeof value !== 'string') {
              errors.push(`${rule.field} must be a string`);
            } else {
              // String length validation
              if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${rule.field} must be at least ${rule.minLength} characters long`);
              }
              if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${rule.field} must be no more than ${rule.maxLength} characters long`);
              }
              // Pattern validation
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
  
    // Check for unexpected fields (optional - can be disabled if needed)
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
  
  // Helper function to add custom validation rules
  export function addValidationRules(dtoName: string, rules: ValidationRule[]): void {
    validationRules[dtoName] = rules;
  }
  
  // Helper function to validate individual fields
  export function validateField(value: any, rule: ValidationRule): string[] {
    const errors: string[] = [];
  
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
        } else {
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