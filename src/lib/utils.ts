import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Indian currency (₹X,XX,XXX.XX)
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(num)) return "₹0.00"

  const isNeg = num < 0
  const abs = Math.abs(num)
  const [intPart, decPart] = abs.toFixed(2).split(".")

  // Indian grouping: last 3 digits, then groups of 2
  let result = ""
  const len = intPart.length
  if (len <= 3) {
    result = intPart
  } else {
    result = intPart.slice(-3)
    let remaining = intPart.slice(0, -3)
    while (remaining.length > 2) {
      result = remaining.slice(-2) + "," + result
      remaining = remaining.slice(0, -2)
    }
    if (remaining.length > 0) {
      result = remaining + "," + result
    }
  }

  return `${isNeg ? "-" : ""}₹${result}.${decPart}`
}

/**
 * Format date to DD/MM/YYYY
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Convert number to words (Indian system)
 */
export function numberToWords(num: number): string {
  if (num === 0) return "Zero"

  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  const convert = (n: number): string => {
    if (n < 20) return ones[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "")
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "")
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "")
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "")
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "")
  }

  const intPart = Math.floor(Math.abs(num))
  const decPart = Math.round((Math.abs(num) - intPart) * 100)

  let result = convert(intPart) + " Rupees"
  if (decPart > 0) {
    result += " and " + convert(decPart) + " Paise"
  }
  result += " Only"

  return result
}

/**
 * Blood group display mapping
 */
export const bloodGroupLabels: Record<string, string> = {
  A_POS: "A+",
  A_NEG: "A-",
  B_POS: "B+",
  B_NEG: "B-",
  O_POS: "O+",
  O_NEG: "O-",
  AB_POS: "AB+",
  AB_NEG: "AB-",
}

/**
 * Membership status display mapping
 */
export const membershipStatusConfig: Record<string, { label: string; color: string; threshold: number }> = {
  PENDING: { label: "Pending", color: "bg-yellow-500", threshold: 0 },
  BASIC: { label: "Basic", color: "bg-blue-500", threshold: 10000 },
  SILVER: { label: "Silver", color: "bg-slate-400", threshold: 35000 },
  GOLD: { label: "Gold", color: "bg-amber-500", threshold: 60000 },
  PLATINUM: { label: "Platinum", color: "bg-slate-800", threshold: 110000 },
}
