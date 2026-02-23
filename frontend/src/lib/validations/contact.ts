import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(5, "Address is required"),
  serviceType: z.string().min(1, "Please select a service"),
  message: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
