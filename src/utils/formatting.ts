/**
 * Formatting utilities for protocol data presentation.
 */

import { ethers } from "ethers";

/**
 * Format a rate value (expressed in ray = 1e27) to an annual percentage.
 */
export function formatRateToAPY(rateRay: bigint): string {
  // Rates in Fluid are per-second rates scaled by 1e27
  // APY = (1 + rate)^seconds_per_year - 1
  const rate = Number(rateRay) / 1e27;
  const secondsPerYear = 365.25 * 24 * 60 * 60;
  const apy = (Math.pow(1 + rate, secondsPerYear) - 1) * 100;
  return `${apy.toFixed(4)}%`;
}

/**
 * Format a simple rate (already as percentage scaled by 1e2 or 1e4).
 */
export function formatPercentage(value: bigint, scale: number = 1e4): string {
  return `${(Number(value) / scale * 100).toFixed(2)}%`;
}

/**
 * Format a bigint token amount given decimals.
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  significantDigits: number = 6
): string {
  const formatted = ethers.formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.000001) return `< 0.000001`;
  return num.toLocaleString("en-US", {
    maximumFractionDigits: significantDigits,
  });
}

/**
 * Format a USD value.
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Truncate an Ethereum address for display.
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Convert a block timestamp to a human-readable date string.
 */
export function formatTimestamp(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toISOString();
}

/**
 * Safe serialization of BigInt values for JSON responses.
 */
export function serializeBigInts(obj: any): any {
  if (typeof obj === "bigint") {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  if (obj !== null && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  return obj;
}
