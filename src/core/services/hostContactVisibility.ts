/** Booking statuses where guests may see host/owner direct contact. */
const HOST_CONTACT_VISIBLE_STATUSES = new Set(['confirmed', 'completed']);

export function shouldShowHostContact(status: string): boolean {
  return HOST_CONTACT_VISIBLE_STATUSES.has(status);
}
