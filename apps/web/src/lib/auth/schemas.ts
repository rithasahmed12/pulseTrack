import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string({ message: 'Email is required.' })
		.min(1, 'Email is required.')
		.email('Enter a valid email address.'),
	password: z
		.string({ message: 'Password is required.' })
		.min(1, 'Password is required.')
		.min(8, 'At least 8 characters.'),
	remember: z.boolean().default(true)
});

export const signupSchema = z
	.object({
		name: z.string().trim().min(1, 'What should we call you?'),
		email: z
			.string({ message: 'Email is required.' })
			.min(1, 'Email is required.')
			.email('Enter a valid email address.'),
		password: z
			.string({ message: 'Password is required.' })
			.min(1, 'Password is required.')
			.min(8, 'At least 8 characters.'),
		confirmPassword: z.string({ message: 'Confirm your password.' }).min(1, 'Confirm your password.'),
		acceptTerms: z.boolean().refine((v) => v === true, { message: 'Please accept the terms.' })
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match.",
		path: ['confirmPassword']
	});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
