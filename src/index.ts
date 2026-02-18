#!/usr/bin/env node

/**
 * Fluid MCP Server
 *
 * A Model Context Protocol server that enables AI agents to interact
 * with the Fluid DeFi protocol across Ethereum, Arbitrum, Base, and Polygon.
 *
 * Features:
 * - READ: Query liquidity data, lending rates, vault positions, DEX pools
 * - WRITE: Build transactions for deposits, withdrawals, borrows, repays, swaps
 *
 * Usage:
 *   npx @fluid-mcp/server          # stdio transport (default)
 *   npx @fluid-mcp/server --sse    # SSE transport for remote agents
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import {
  lendingReadTools,
  vaultReadTools,
  lendingWriteTools,
  vaultWriteTools,
} from "./tools/index.js";

import { SUPPORTED_CHAINS } from "./config/chains.js";

// ─── Create MCP Server ───────────────────────────────────────────────────────

const server = new McpServer({
  name: "fluid-mcp-server",
  version: "1.0.0",
  description: `Fluid DeFi Protocol MCP Server — interact with lending, borrowing, vaults, and DEX swaps across ${SUPPORTED_CHAINS.join(", ")}`,
});

// ─── Register all tools ──────────────────────────────────────────────────────

function registerToolGroup(tools: Record<string, any>) {
  for (const [name, tool] of Object.entries(tools)) {
    server.tool(name, tool.description, tool.schema.shape, tool.handler);
  }
}

// READ tools
registerToolGroup(lendingReadTools);
registerToolGroup(vaultReadTools);

// WRITE tools
registerToolGroup(lendingWriteTools);
registerToolGroup(vaultWriteTools);

// ─── Register resources ──────────────────────────────────────────────────────

server.resource(
  "supported-chains",
  "fluid://chains",
  async () => ({
    contents: [
      {
        uri: "fluid://chains",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            description: "Chains where Fluid protocol is deployed",
            chains: SUPPORTED_CHAINS,
            details: {
              ethereum: { chainId: 1, protocols: ["liquidity", "lending", "vault", "dex"] },
              arbitrum: { chainId: 42161, protocols: ["liquidity", "lending", "vault", "dex"] },
              base: { chainId: 8453, protocols: ["liquidity", "lending", "vault", "dex"] },
              polygon: { chainId: 137, protocols: ["liquidity", "lending", "vault", "dex"] },
            },
          },
          null,
          2
        ),
      },
    ],
  })
);

server.resource(
  "protocol-overview",
  "fluid://overview",
  async () => ({
    contents: [
      {
        uri: "fluid://overview",
        mimeType: "application/json",
        text: JSON.stringify(
          {
            name: "Fluid Protocol",
            developer: "Instadapp",
            description:
              "Fluid is a DeFi protocol that unifies lending, borrowing, and trading into a single efficient liquidity layer. It supports high LTV ratios (up to 95%), smart collateral/debt via DEX integration, and ERC4626-compliant lending tokens (fTokens).",
            architecture: {
              liquidityLayer:
                "Core contract holding all funds. Only interacts with protocols built on top, not end users. Single operate() interface for all actions.",
              lendingProtocol:
                "ERC4626-compliant fTokens for deposit-and-earn. Direct access to the Liquidity Layer.",
              vaultProtocol:
                "Single-asset collateral, single-debt vaults with NFT-based positions. High LTV, low liquidation penalties.",
              dexProtocol:
                "Built on the Liquidity Layer with smart collateral and smart debt. Users earn LP fees on collateral and even on borrowed positions.",
            },
            links: {
              website: "https://fluid.io",
              docs: "https://docs.fluid.instadapp.io",
              github: "https://github.com/Instadapp/fluid-contracts-public",
              governance: "https://gov.fluid.io",
            },
          },
          null,
          2
        ),
      },
    ],
  })
);

// ─── Register prompts ────────────────────────────────────────────────────────

server.prompt(
  "analyze-lending-rates",
  "Analyze lending rates across all fTokens on a chain to find the best yield opportunities.",
  { chain: z.string().optional().describe("Chain to analyze (default: ethereum)") as any },
  (args: { chain?: string }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Analyze the current lending rates on Fluid protocol on ${args.chain || "ethereum"}.

Steps:
1. Call fluid_get_all_ftokens_details to get all fToken data
2. Sort by supply rate (APY) from highest to lowest
3. For each fToken, note: name, underlying asset, supply rate, rewards rate, total TVL
4. Summarize the best yield opportunities
5. Note any active reward programs`,
        },
      },
    ],
  })
);

server.prompt(
  "check-vault-health",
  "Check the health of a specific vault position by NFT ID.",
  {
    chain: z.string().optional() as any,
    nft_id: z.string().describe("Position NFT ID to check") as any,
  },
  (args: { chain?: string; nft_id: string }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Check the health of vault position #${args.nft_id} on ${args.chain || "ethereum"}.

Steps:
1. Call fluid_get_vault_position with nft_id=${args.nft_id}
2. Note the supply (collateral) and borrow (debt) amounts
3. Check if the position is liquidated
4. Calculate the current LTV ratio
5. Compare against the vault's liquidation threshold
6. Provide a health assessment and recommendations`,
        },
      },
    ],
  })
);

server.prompt(
  "find-swap-route",
  "Find the best swap route and estimate output for a token swap on Fluid DEX.",
  {
    chain: z.string().optional() as any,
    token_in: z.string().describe("Input token address") as any,
    token_out: z.string().describe("Output token address") as any,
    amount: z.string().describe("Amount to swap (in raw units)") as any,
  },
  (args: { chain?: string; token_in: string; token_out: string; amount: string }) => ({
    messages: [
      {
        role: "user" as const,
        content: {
          type: "text" as const,
          text: `Find the best swap route for ${args.amount} of ${args.token_in} → ${args.token_out} on ${args.chain || "ethereum"}.

Steps:
1. Call fluid_get_all_pools_reserves to see all available pools
2. Find pools that include both tokens (direct route) or intermediate pools (multi-hop)
3. For direct routes, call fluid_estimate_swap_in to get the output estimate
4. Compare rates across pools if multiple options exist
5. Recommend the best route with estimated output and price impact`,
        },
      },
    ],
  })
);

// Need to import z for the prompts
import { z } from "zod";

// ─── Start server ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Fluid MCP Server running on stdio");
  console.error(`Supported chains: ${SUPPORTED_CHAINS.join(", ")}`);
  console.error(`Tools registered: ${Object.keys({
    ...lendingReadTools,
    ...vaultReadTools,
    ...lendingWriteTools,
    ...vaultWriteTools,
  }).length}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
