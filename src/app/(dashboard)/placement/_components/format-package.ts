/**
 * formatPackage
 * -------------
 * Stores the raw rupee value in the DB for both types.
 *
 * Internship : user enters ₹/month (e.g. 30000) → display "₹30,000/mo"
 * Full Time  : user enters total annual CTC in ₹ (e.g. 3000000) → display "30 LPA"
 *              (divide by 1,00,000 — one lakh)
 */
export function formatPackage(
  value: number,
  internshipOrFullTime: string,
  variant: "short" | "long" = "short"
): string {
  if (internshipOrFullTime === "INTERNSHIP") {
    const suffix = variant === "long" ? "/month" : "/mo";
    return `₹${value.toLocaleString("en-IN")}${suffix}`;
  }

  // Full-time: convert raw rupees → LPA
  const lpa = value / 100000;
  // Remove trailing zeros after decimal (e.g. 30.00 → "30", 12.50 → "12.5")
  const formatted =
    lpa % 1 === 0
      ? lpa.toFixed(0)
      : parseFloat(lpa.toFixed(2)).toString();

  return `${formatted} LPA`;
}

/**
 * packagePlaceholder / packageLabel
 * Used in the Add/Edit modal input field.
 */
export function packageLabel(internshipOrFullTime: string): string {
  return internshipOrFullTime === "INTERNSHIP"
    ? "Stipend (₹/month)"
    : "Package (₹ annual CTC)";
}

export function packagePlaceholder(internshipOrFullTime: string): string {
  return internshipOrFullTime === "INTERNSHIP"
    ? "e.g. 30000"
    : "e.g. 3000000";
}
