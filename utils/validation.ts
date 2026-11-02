import { z } from "zod";

import {
	FinancialValidationError,
	normalizeFinancialInput,
} from "./financial-validation";

/* --------------------------------- Schema --------------------------------- */
export const EarningFormSchema = z
	.object({
		compensation: z.string(),
		compensationMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		compInCash: z.string().optional(),
		compInGift: z.string().optional(),
		giftCode: z.string().optional(),

		tip: z.string(),
		tipMethods: z.array(z.enum(["Cash", "Card", "Gift Card"])),
		tipInCash: z.string().optional(),
		tipInGift: z.string().optional(),

		discount: z.string().optional(),
		discountType: z.enum(["Amount", "Percent"]).optional(),
		supply: z.string().optional(),

		services: z.array(z.string()).optional(),
		serviceDate: z
			.number()
			.refine(
				(value) =>
					Number.isFinite(value) && !Number.isNaN(new Date(value).getTime()),
				"Service date is required",
			),
		technicianId: z.string().min(1, "Technician is required"),
		clientId: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		try {
			normalizeFinancialInput(data);
		} catch (error) {
			if (!(error instanceof FinancialValidationError)) throw error;
			ctx.addIssue({
				code: "custom",
				message: error.message,
				path: [error.field],
			});
		}
	});

export type EarningFormValidation = z.infer<typeof EarningFormSchema>;
