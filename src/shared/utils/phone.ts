/** Normalise a Kenyan mobile number to +2547XXXXXXXX / +2541XXXXXXXX, or null if invalid. */
export function normaliseKenyanPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  let local = digits;
  if (local.startsWith("254")) local = local.slice(3);
  else if (local.startsWith("0")) local = local.slice(1);
  if (!/^[17]\d{8}$/.test(local)) return null;
  return `+254${local}`;
}
