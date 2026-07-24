import { Decimal } from "@prisma/client/runtime/library";

export function formatINR(amount: number | Decimal | string): string {
  const num =
    typeof amount === "object" && "toNumber" in amount
      ? (amount as Decimal).toNumber()
      : Number(amount);

  // Indian number format: last 3 digits, then groups of 2
  const [intPart, decPart] = Math.abs(num).toFixed(2).split(".");
  const lastThree = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const formatted =
    rest.length > 0
      ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;

  const sign = num < 0 ? "-" : "";
  if (decPart === "00") {
    return `${sign}₹${formatted}`;
  }
  return `${sign}₹${formatted}.${decPart}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
