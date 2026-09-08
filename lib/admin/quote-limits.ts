// Shared between the admin form (client-side maxLength/UX) and the API
// validator (server-side enforcement), so a long value can't slip in
// through a direct API call and break the card/modal layout.
export const QUOTE_LIMITS = {
  topic: 40,
  title: 100,
  body: 900,
  author: 80,
} as const;
