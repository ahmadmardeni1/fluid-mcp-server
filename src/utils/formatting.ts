/**
 * Formatting utilities for protocol data presentation.
 */

import { ethers } from "ethers";

const TWO_POW_256 = 2n ** 256n;

/**
 * Decode a uint256 that actually represents a two's complement int256.
 * Fluid stores negative borrow values (smart debt/col) as uint256 on-chain.
 * A value > 2^255 - 1 means it's a negative int256.
 */
export function decodeInt256(raw: bigint): bigint {
  const MAX_INT256 = (TWO_POW_256 / 2n) - 1n;
  if (raw > MAX_INT256) {
    return raw - TWO_POW_256;
  }
  return raw;
}

/**
 * Fluid vault exchange prices are scaled by 1e12.
 * To convert shares to actual token amounts:
 *   tokenAmount = (shares * exchangePrice) / 1e12
 *
 * The result is in the token's native decimals.
 */
export const EXCHANGE_PRICE_PRECISION = 10n ** 12n;

/**
 * Convert vault shares to actual token amount using exchange price.
 * Returns the amount in token's smallest unit (needs formatUnits for display).
 */
export function sharesToTokenAmount(
  shares: bigint,
  exchangePrice: bigint
): bigint {
  if (shares === 0n || exchangePrice === 0n) return 0n;
  // Use absolute value for calculation, preserve sign
  const absShares = shares < 0n ? -shares : shares;
  const absAmount = (absShares * exchangePrice) / EXCHANGE_PRICE_PRECISION;
  return shares < 0n ? -absAmount : absAmount;
}

/**
 * Format a Fluid rate value to a percentage string.
 *
 * Fluid resolver rates are in basis points (1 unit = 0.01%).
 * e.g. supplyRate 407 => 4.07%, borrowRate 253 => 2.53%
 */
export function formatRateToAPY(rateBps: bigint): string {
  const pct = Number(rateBps) / 100;
  return `${parseFloat(pct.toFixed(2))}%`;
}

/**
 * Format a simple rate (already as percentage scaled by 1e2 or 1e4).
 */
export function formatPercentage(value: bigint, scale: number = 1e4): string {
  return `${(Number(value) / scale * 100).toFixed(2)}%`;
}

/**
 * Format a vault config value that is in basis points (1e4 = 100%).
 * e.g. collateralFactor 8800 => "88%", liquidationThreshold 31605 => "316.05%"
 */
export function formatVaultPercent(basisPoints: number): string {
  const pct = basisPoints / 100;
  // Use up to 2 decimal places, strip trailing zeros
  return `${parseFloat(pct.toFixed(2))}%`;
}

/**
 * Format a bigint token amount given decimals.
 * If decimals is unreasonable (>30), returns the raw string instead of formatting.
 */
export function formatTokenAmount(
  amount: bigint,
  decimals: number,
  significantDigits: number = 6
): string {
  // Guard against unreasonable decimals (e.g. T3/T4 vaults with DEX LP tokens)
  if (decimals > 30) {
    return amount.toString();
  }
  const isNegative = amount < 0n;
  const absAmount = isNegative ? -amount : amount;
  const formatted = ethers.formatUnits(absAmount, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return "0";
  if (num < 0.000001) return `< 0.000001`;
  const display = num.toLocaleString("en-US", {
    maximumFractionDigits: significantDigits,
  });
  return isNegative ? `-${display}` : display;
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
