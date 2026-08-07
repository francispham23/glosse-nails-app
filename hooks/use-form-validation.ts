import { useState } from "react";
import { z } from "zod";

interface ValidationError {
	[key: string]: string;
}

/**
 * Pure validation helper: runs a zod schema and returns a field-keyed error map.
 * Extracted from the `useFormValidation` hook so it can be unit-tested without
 * a React renderer. Returns `{ success, errors }`.
 */
export function validateSchema(
	schema: z.ZodSchema,
	data: unknown,
): { success: boolean; errors: ValidationError } {
	try {
		schema.parse(data);
		return { success: true, errors: {} };
	} catch (error) {
		const errors: ValidationError = {};
		if (error instanceof z.ZodError) {
			error.issues.forEach((err) => {
				const path = err.path.join(".");
				errors[path] = err.message;
			});
		}
		return { success: false, errors };
	}
}

export function useFormValidation<T extends z.ZodSchema>(schema: T) {
	const [errors, setErrors] = useState<ValidationError>({});

	const validate = (data: unknown): boolean => {
		const result = validateSchema(schema, data);
		setErrors(result.errors);
		return result.success;
	};

	const clearErrors = () => setErrors({});
	const getFieldError = (fieldName: string) => errors[fieldName];

	return { errors, validate, clearErrors, getFieldError };
}
