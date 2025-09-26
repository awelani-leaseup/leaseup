/**
 * Resend Test Email Utility
 *
 * This utility provides functions to use Resend test emails in development
 * environments for safe email testing without affecting real email addresses.
 *
 * Based on Resend documentation: https://resend.com/docs/dashboard/emails/send-test-emails
 */

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev';

/**
 * Resend test email addresses for different scenarios
 */
export const RESEND_TEST_EMAILS = {
  DELIVERED: 'delivered@resend.dev',
  BOUNCED: 'bounced@resend.dev',
  COMPLAINED: 'complained@resend.dev',
} as const;

/**
 * Generate a test email address with optional labeling for development
 * In production, returns the original email unchanged
 *
 * @param originalEmail - The original email address
 * @param scenario - The test scenario (delivered, bounced, complained)
 * @param label - Optional label for tracking different test scenarios
 * @returns Test email address in development, original email in production
 */
export const getTestEmailAddress = (
  originalEmail: string,
  scenario: keyof typeof RESEND_TEST_EMAILS = 'DELIVERED',
  label?: string
): string => {
  if (!isDevelopment) {
    return originalEmail;
  }

  const baseTestEmail = RESEND_TEST_EMAILS[scenario];

  if (!label) {
    return baseTestEmail;
  }

  // Add label after the + symbol for tracking
  const [localPart, domain] = baseTestEmail.split('@');
  return `${localPart}+${label}@${domain}`;
};

/**
 * Get test email address specifically for landlord notifications
 */
export const getLandlordTestEmail = (
  landlordEmail: string,
  landlordId: string,
  scenario: keyof typeof RESEND_TEST_EMAILS = 'DELIVERED'
): string => {
  return getTestEmailAddress(
    landlordEmail,
    scenario,
    `landlord-${landlordId.slice(-6)}` // Use last 6 chars of ID for uniqueness
  );
};

/**
 * Get test email address specifically for tenant notifications
 */
export const getTenantTestEmail = (
  tenantEmail: string,
  tenantId: string,
  scenario: keyof typeof RESEND_TEST_EMAILS = 'DELIVERED'
): string => {
  return getTestEmailAddress(
    tenantEmail,
    scenario,
    `tenant-${tenantId.slice(-6)}` // Use last 6 chars of ID for uniqueness
  );
};

/**
 * Get test email address for invoice-related notifications
 */
export const getInvoiceTestEmail = (
  recipientEmail: string,
  invoiceId: string,
  recipientType: 'landlord' | 'tenant' = 'landlord',
  scenario: keyof typeof RESEND_TEST_EMAILS = 'DELIVERED'
): string => {
  return getTestEmailAddress(
    recipientEmail,
    scenario,
    `${recipientType}-invoice-${invoiceId.slice(-6)}`
  );
};

/**
 * Log test email usage for debugging
 */
export const logTestEmailUsage = (
  originalEmail: string,
  testEmail: string,
  context: string
): void => {
  if (isDevelopment && originalEmail !== testEmail) {
    console.log(
      `[RESEND TEST EMAIL] ${context}: ${originalEmail} -> ${testEmail}`
    );
  }
};

export { isDevelopment };
