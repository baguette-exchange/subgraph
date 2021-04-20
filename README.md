# Baguette Subgraph

An open source subgraph index for Baguette -- a community-driven decentralized exchange powered by Avalanche.

This subgraph dynamically tracks any pair created by the Baguette factory. It tracks the current state of Baguette
contracts, and contains derived stats for things like historical data.

- aggregated data across pairs and tokens,
- data on individual pairs and tokens,
- data on transactions
- data on liquidity providers
- historical data on Baguette, pairs or tokens, aggregated by day

## Running Locally

Make sure to update package.json settings to point to your own graph account.

## Queries

Below are a few ways to show how to query the Baguette subgraph for data. The queries show most of the information that
is queryable, but there are many other filtering options that can be used, just check out the
[querying api](https://thegraph.com/docs/graphql-api).

## Key Entity Overviews

#### BaguetteFactory

Contains data across all of Baguette. This entity tracks important things like total liquidity, all time volume,
transaction count, number of pairs and more.

#### Token

Contains data on a specific token. This token specific data is aggregated across all pairs, and is updated whenever
there is a transaction involving that token.

#### Pair

Contains data on a specific pair.

#### Transaction

Every transaction on Baguette is stored. Each transaction contains an array of mints, burns, and swaps that occured within it.

#### Mint, Burn, Swap

These contain specifc information about a transaction. Things like which pair triggered the transaction, amounts,
sender, recipient, and more. Each is linked to a parent Transaction entity.

## Example Queries

### Querying Aggregated Baguette Data

This query fetches aggredated data from all Baguette pairs and tokens, to give a view into how much activity is
happening within the whole protocol.

```graphql
{
  baguetteFactories(first: 1) {
    pairCount
    totalVolumeUSD
    totalLiquidityUSD
  }
}
```
