import { useState } from "react";
import { z } from "zod";

interface ValidationError {
	[key: string]: string;
}

export function useFormValidation<T extends z.ZodSchema>(schema: T) {
	const [errors, setErrors] = useState<ValidationError>({});

	const validate = (data: unknown): boolean => {
		try {
			schema.parse(data);
			setErrors({});
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				const newErrors: ValidationError = {};
				error.issues.forEach((err) => {
					const path = err.path.join(".");
					newErrors[path] = err.message;
				});
				setErrors(newErrors);
			}
			return false;
		}
	};

	const clearErrors = () => setErrors({});
	const getFieldError = (fieldName: string) => errors[fieldName];

	return { errors, validate, clearErrors, getFieldError };
}
