export type FormData = {
  fullName: string;
  email: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};
export type Field = keyof FormData;
export type Step = 1 | 2 | 3;
export type Errors = Partial<Record<Field, string>>;
export type RegistrationState = { step: Step; data: FormData };

export const initialState: RegistrationState = {
  step: 1,
  data: { fullName: '', email: '', street: '', city: '', postalCode: '', country: '' },
};

// One small field list drives the inputs and review screen.
export const fields: { name: Field; label: string; step: Step; autoComplete: string }[] = [
  { name: 'fullName', label: 'Full name', step: 1, autoComplete: 'name' },
  { name: 'email', label: 'Email', step: 1, autoComplete: 'email' },
  { name: 'street', label: 'Street address', step: 2, autoComplete: 'street-address' },
  { name: 'city', label: 'City', step: 2, autoComplete: 'address-level2' },
  { name: 'postalCode', label: 'Postal code', step: 2, autoComplete: 'postal-code' },
  { name: 'country', label: 'Country', step: 2, autoComplete: 'country-name' },
];

export function validate(data: FormData, step: Step): Errors {
  const errors: Errors = {};
  for (const field of fields) {
    if (step !== 3 && field.step !== step) continue;
    if (!data[field.name].trim()) errors[field.name] = `${field.label} is required.`;
  }
  if ((step === 1 || step === 3) && data.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  return errors;
}
