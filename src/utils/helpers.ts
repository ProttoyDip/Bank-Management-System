// Generate a unique loan number like "LN" + timestamp-based string
export function generateLoanNumber(): string {
    return "LN" + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100).toString().padStart(2, "0");
}

// Generate a unique transaction reference number like "TXN" + timestamp-based string
export function generateReferenceNumber(): string {
    return "TXN" + Date.now().toString().slice(-9) + Math.floor(Math.random() * 100).toString().padStart(2, "0");
}

// Calculate EMI using standard formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
// principal: loan amount, annualRate: annual interest rate (%), months: duration in months
export function calculateEMI(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) {
        return principal / months;
    }
    const factor = Math.pow(1 + monthlyRate, months);
    return (principal * monthlyRate * factor) / (factor - 1);
}
