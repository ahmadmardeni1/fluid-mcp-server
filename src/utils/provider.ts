/**
 * Ethereum provider management — creates and caches JSON-RPC providers per chain.
 */

import { ethers } from "ethers";
import { getChainConfig, type ChainConfig } from "../config/chains.js";

const providerCache = new Map<string, ethers.JsonRpcProvider>();

/**
 * Get or create a JSON-RPC provider for a given chain.
 * Uses custom RPC URL if provided, otherwise falls back to chain default.
 */
export function getProvider(
  chain: string,
  customRpc?: string
): ethers.JsonRpcProvider {
  const config = getChainConfig(chain);
  const rpcUrl = customRpc || config.rpcDefault;

  const cacheKey = `${chain}:${rpcUrl}`;
  let provider = providerCache.get(cacheKey);
  if (!provider) {
    provider = new ethers.JsonRpcProvider(rpcUrl, config.chainId, {
      staticNetwork: true,
    });
    providerCache.set(cacheKey, provider);
  }
  return provider;
}

/**
 * Create an ethers Contract instance for a given address and ABI.
 * Accepts both string[] (human-readable) and object[] (JSON ABI) formats.
 */
export function getContract(
  address: string,
  abi: any[],
  provider: ethers.JsonRpcProvider
): ethers.Contract {
  // Normalize address to proper EIP-55 checksum format
  const checksummed = ethers.getAddress(address.toLowerCase());
  return new ethers.Contract(checksummed, abi, provider);
}

/**
 * Create a signer from a private key for write operations.
 * The agent must provide the private key — we never store it.
 */
export function getSigner(
  privateKey: string,
  provider: ethers.JsonRpcProvider
): ethers.Wallet {
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Format a bigint value to a human-readable decimal string.
 */
export function formatUnits(value: bigint, decimals: number): string {
  return ethers.formatUnits(value, decimals);
}

/**
 * Parse a decimal string to a bigint value.
 */
export function parseUnits(value: string, decimals: number): bigint {
  return ethers.parseUnits(value, decimals);
}

/**
 * Get the current chain config from environment or argument.
 */
export function resolveChainConfig(chain: string): ChainConfig {
  return getChainConfig(chain);
}
