/* eslint-disable prefer-const */
import { BigInt, BigDecimal, store, Address } from '@graphprotocol/graph-ts'
import {
  Pair,
  Token,
  BaguetteFactory,
  Transaction,
  Mint as MintEvent,
  Burn as BurnEvent,
  Swap as SwapEvent,
  Bundle,
} from '../types/schema'
import { Pair as PairContract, Mint, Burn, Swap, Transfer, Sync } from '../types/templates/Pair/Pair'
import { updatePairDayData, updateTokenDayData, updateBaguetteDayData, updatePairHourData } from './dayUpdates'
import { getEthPriceInUSD, findEthPerToken, getTrackedVolumeUSD, getTrackedLiquidityUSD } from './pricing'
import {
  convertTokenToDecimal,
  ADDRESS_ZERO,
  FACTORY_ADDRESS,
  ROUTER_ADDRESS,
  ONE_BI,
  createUser,
  createLiquidityPosition,
  createYieldYakLiquidityPosition,
  ZERO_BD,
  BI_18,
  createLiquiditySnapshot
} from './helpers'

let MINING_POOLS: string[] = [
  "0x2bce0cab94770d0f2eae3e8a582adc3eaa0bd81f", // bag > bag
  "0x706c57a2755956e3978f6b4986513e78d0a06520", // avax > bag
  "0xfc6b409109e84b681786660405cff09c43fe9b4e", // xava > bag
  "0x5053494d1efa7514c1d72cca8d8dca40d8119fcc", // bag > lyd
  "0xcf09570845adc0df5dcfa5b93882b115ed0da89c", // qi > bag
  "0x3141ae9c20b952917384d7527d136d10ee06b969", // wet > wet
  "0x266cb810a383b70bfeca7285e0464746690e849b", // bag-avax
  "0x6268c39511825d9a3fd4e7de75e8a4c784dca02b", // bag-dai
  "0x7b68d44fcdef34a57f5c95c4a46c8a2e72fae4e2", // bag-eth
  "0x507b2f7435e8ff982a17ced0988832e632c60e7e", // bag-wbtc
  '0x3963b5b570f9eae630d645c109d3bdec299cbbee', // bag-xava
  "0x1c596eaa585263519adc39d3896b6ae35c5830f6", // bag-link
  "0xeb5069ae76f3f07bfebb4497c85efa9740520847", // bag-usdt
  "0x1d96eb4bde096ef3a73583e02b3ffa4c2bb97933", // bag-shibx
  "0x81a6fedcf8bd3de346b3d368904f536ffa13fdf0", // bag-usdte
  "0x3c8201d13a6c573518574bf9bbd763318664eafa", // bag-linke
  "0x8fab6f3c7fbca7b9aacb56bb4f17bc73c31e3f50", // bag-wethe
  "0x4aafe44a0cdec72be791271013cee8af3f8c5753", // bag-yak
  "0x8bcacf09adf3d9404ef34c3324eeec525adb5a65", // bag-qi
  "0x12bca09acbee692fdd8473e68cf0ecd83570b111", // bag-wet
  "0xe01c00179b9e8cfdcfae163a6e86015a8615b9e6", // bag-usdce
  "0x0e1d741a93705798288761b02644af69402f055e", // bag-xmtl
  "0x6ee37a9b55e3f634dfeb1db065a8c7da2e2a3d4c", // bag-xslr
  "0x63329832b33b7539b5ff629d671cb66d4b41c04b", // bag-xcrs
  "0x4487c087e57c45577a2583115160f778de52d53a", // bag-klo
  "0x6cbb1696d45e066b4ca79c58690d5b5146be94c5", // avax-link
  "0xdb12cd73c8b547511e0171ea76223df227d27ceb", // avax-usdt
  "0x30393161e53b56e51a4f4c72d3c6ae6907f44a2f", // avax-dai
  "0x03800269e547f683a2f34c7426782eef7e1e5440", // avax-eth
  "0xf125771f27b5a639c08e3086872085f8270c3ffb", // avax-wbtc
  "0xf74c010cb319fda048006742ae2bdcca71beccba", // avax-xava
  "0xe958dcc86632d7421a86133026423a232ea2212e", // avax-shibx
  "0xb00d89c3f65cef0742f9d0cc59c9ad90a01b8faf", // avax-usdte
  "0x3a2d34b6ca91c33a8042ddb00b5f68d2e2834267", // avax-linke
  "0x9c8cdcc785dba292f8bccff533c5622e06f0b76c", // avax-wethe
  "0xe1974858008ba95dc515fe72650bfa81125718bc", // avax-yak
  "0xc10f947e9ffffac56a8ace7eca988c494f72d9f0", // avax-klo
  "0x4783bcc75ac074433f134f8c418bd1c3d5aa4292", // avax-usdce
  "0x34f0a733cb0d1f92ca3502a04c73f983346270c2", // usde-usdte
];

let YIELDYAK_POOLS: string[] = [
  '0xf487044ed85f2d47a8ead6b86c834976b8c31736', // bag
  '0x58887009a412ad52a4fb746d0846585346d83bc0', // avax
  '0x562acea3c03dbddc25e2f24bb2685d17bdb4e62f', // xava
  '0x908698b561ea14f153ddd1ee02f99ebe0a4cea0f', // bag-avax
  '0xb667121b4d4b6ea5de4bb61bd3a02e53529bfcca', // bag-xava
  '0xbd9f16eee869808bf22823427d1f4a1e7a440e8d', // bag-eth
  '0x90e24a2dfd80f02d01c7b630e8e3199c8a0388d3', // bag-link
  '0x165fa1023429e266cd767845e8de419ce3abd379', // bag-usdt
  '0x8f871d05d7afb9daffa5df13a91c74e870e6c31e', // bag-wbtc
  '0x142b4e2c9234afc3dc07e12d24493a4ef26c537c', // bag-wethe
  '0x3ca2cfd8e17c40ac6f4aa6c1a4b1723f0bf59dd8', // bag-linke
  '0xb940da8b71791c1f42cc612d1af427878ec1a369', // bag-usdte
  '0x1b53500677cb1b042b12081a8661a6f08781d58c', // bag-yak
  '0x9ee89f3a3dfd596bb6f53696e2ed1d09c738f8c8', // bag-qi
  '0x211654525dc64a7f74f6361d6f3dc0710108ae43', // bag-wet
  '0xfd1f86448b56942c32b954092f2fdbce91e37bf6', // avax-usdt
  '0xfb5aa7660fde5013996fd72a193accf00212af32', // avax-link
  '0x39f7fcb3af11b0a274514c581d468739e75f64ec', // avax-xava
  '0x8c3c86bea8ed5acbce4944def6731291eb193c26', // avax-eth
  '0xfc47515433ee291e692958a2d15f99896fafc0bc', // avax-wbtc
];

function isCompleteMint(mintId: string): boolean {
  return MintEvent.load(mintId).sender !== null // sufficient checks
}

export function handleTransfer(event: Transfer): void {
  let eventToAsHexString = event.params.to.toHexString()
  let eventFromAsHexString = event.params.from.toHexString()
  let eventHashAsHexString = event.transaction.hash.toHexString()

  // ignore initial transfers for first adds
  if (eventToAsHexString == ADDRESS_ZERO && event.params.value.equals(BigInt.fromI32(1000))) {
    return
  }

  // skip if staking/unstaking
  if (MINING_POOLS.includes(eventFromAsHexString) || MINING_POOLS.includes(eventToAsHexString)) {
    return
  }

  // user stats
  let from = event.params.from
  createUser(from)
  let to = event.params.to
  createUser(to)

  // if in/out of a Yield Yak pool, update liquidity position
  if (YIELDYAK_POOLS.includes(eventFromAsHexString) || YIELDYAK_POOLS.includes(eventToAsHexString)) {
    // liquidity token amount being transfered
    let value = convertTokenToDecimal(event.params.value, BI_18)

    if (YIELDYAK_POOLS.includes(eventToAsHexString)) {
      // ignore minting by the YY contract on reinvest
      if (eventFromAsHexString == ADDRESS_ZERO) {
        return
      }

      // store liquidity amount deposited to YY pool
      let userYYLiquidityPosition = createYieldYakLiquidityPosition(to, from, event.address)
      userYYLiquidityPosition.liquidityTokenBalance = userYYLiquidityPosition.liquidityTokenBalance.minus(value)
      userYYLiquidityPosition.save()
    }

    if (YIELDYAK_POOLS.includes(eventFromAsHexString)) {
      // decrement the liquidity of the YY pool by the withdrawn amount
      let userYYLiquidityPosition = createYieldYakLiquidityPosition(from, to, event.address)
      userYYLiquidityPosition.liquidityTokenBalance = userYYLiquidityPosition.liquidityTokenBalance.plus(value)

      // residual YY pool amount is the liquidity gain, add it to the liquidity position
      let toUserLiquidityPosition = createLiquidityPosition(event.address, to)
      toUserLiquidityPosition.liquidityTokenBalance = toUserLiquidityPosition.liquidityTokenBalance
        .plus(userYYLiquidityPosition.liquidityTokenBalance)
      toUserLiquidityPosition.save()
      createLiquiditySnapshot(toUserLiquidityPosition, event)

      // reset the YY liquidity amount
      userYYLiquidityPosition.liquidityTokenBalance = ZERO_BD
      userYYLiquidityPosition.save()
    }

    return
  }

  let factory = BaguetteFactory.load(FACTORY_ADDRESS)

  // get pair and load contract
  let pair = Pair.load(event.address.toHexString())
  let pairContract = PairContract.bind(event.address)

  // liquidity token amount being transferred
  let value = convertTokenToDecimal(event.params.value, BI_18)

  // get or create transaction
  let transaction = Transaction.load(eventHashAsHexString)
  if (transaction === null) {
    transaction = new Transaction(eventHashAsHexString)
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.mints = []
    transaction.burns = []
    transaction.swaps = []
  }

  // mints
  let mints = transaction.mints
  if (eventFromAsHexString == ADDRESS_ZERO && eventToAsHexString != ADDRESS_ZERO) {
    // update total supply
    pair.totalSupply = pair.totalSupply.plus(value)
    pair.save()

    // create new mint if no mints so far or if last one is done already
    if (mints.length === 0 || isCompleteMint(mints[mints.length - 1])) {
      let mint = new MintEvent(
        eventHashAsHexString
          .concat('-')
          .concat(BigInt.fromI32(mints.length).toString())
      )
      mint.transaction = transaction.id
      mint.pair = pair.id
      mint.to = to
      mint.liquidity = value
      mint.timestamp = transaction.timestamp
      mint.transaction = transaction.id
      mint.save()

      // update mints in transaction
      transaction.mints = mints.concat([mint.id])

      // save entities
      transaction.save()
      factory.save()
    }
  }

  // case where direct send first on ETH withdrawls
  if (eventToAsHexString == pair.id) {
    let burns = transaction.burns
    let burn = new BurnEvent(
      eventHashAsHexString
        .concat('-')
        .concat(BigInt.fromI32(burns.length).toString())
    )
    burn.transaction = transaction.id
    burn.pair = pair.id
    burn.liquidity = value
    burn.timestamp = transaction.timestamp
    burn.to = event.params.to
    burn.sender = event.params.from
    burn.needsComplete = true
    burn.transaction = transaction.id
    burn.save()

    // TODO: Consider using .concat() for handling array updates to protect
    // against unintended side effects for other code paths.
    burns.push(burn.id)
    transaction.burns = burns
    transaction.save()
  }

  // burn
  if (eventToAsHexString == ADDRESS_ZERO && eventFromAsHexString == pair.id) {
    pair.totalSupply = pair.totalSupply.minus(value)
    pair.save()

    // this is a new instance of a logical burn
    let burns = transaction.burns
    let burn: BurnEvent
    if (burns.length > 0) {
      let currentBurn = BurnEvent.load(burns[burns.length - 1])
      if (currentBurn.needsComplete) {
        burn = currentBurn as BurnEvent
      } else {
        burn = new BurnEvent(
          eventHashAsHexString
            .concat('-')
            .concat(BigInt.fromI32(burns.length).toString())
        )
        burn.transaction = transaction.id
        burn.needsComplete = false
        burn.pair = pair.id
        burn.liquidity = value
        burn.transaction = transaction.id
        burn.timestamp = transaction.timestamp
      }
    } else {
      burn = new BurnEvent(
        eventHashAsHexString
          .concat('-')
          .concat(BigInt.fromI32(burns.length).toString())
      )
      burn.transaction = transaction.id
      burn.needsComplete = false
      burn.pair = pair.id
      burn.liquidity = value
      burn.transaction = transaction.id
      burn.timestamp = transaction.timestamp
    }

    // if this logical burn included a fee mint, account for this
    if (mints.length !== 0 && !isCompleteMint(mints[mints.length - 1])) {
      let mint = MintEvent.load(mints[mints.length - 1])
      burn.feeTo = mint.to
      burn.feeLiquidity = mint.liquidity
      // remove the logical mint
      store.remove('Mint', mints[mints.length - 1])
      // update the transaction

      // TODO: Consider using .slice().pop() to protect against unintended
      // side effects for other code paths.
      mints.pop()
      transaction.mints = mints
      transaction.save()
    }
    burn.save()
    // if accessing last one, replace it
    if (burn.needsComplete) {
      // TODO: Consider using .slice(0, -1).concat() to protect against
      // unintended side effects for other code paths.
      burns[burns.length - 1] = burn.id
    }
    // else add new one
    else {
      // TODO: Consider using .concat() for handling array updates to protect
      // against unintended side effects for other code paths.
      burns.push(burn.id)
    }
    transaction.burns = burns
    transaction.save()
  }

  if (eventFromAsHexString != ADDRESS_ZERO && eventToAsHexString != pair.id) {
    let fromUserLiquidityPosition = createLiquidityPosition(event.address, from)
    fromUserLiquidityPosition.liquidityTokenBalance = fromUserLiquidityPosition.liquidityTokenBalance.minus(convertTokenToDecimal(event.params.value, BI_18))
    fromUserLiquidityPosition.save()
    createLiquiditySnapshot(fromUserLiquidityPosition, event)
  }

  if (eventToAsHexString != ADDRESS_ZERO && eventToAsHexString != pair.id) {
    let toUserLiquidityPosition = createLiquidityPosition(event.address, to)
    toUserLiquidityPosition.liquidityTokenBalance = toUserLiquidityPosition.liquidityTokenBalance.plus(convertTokenToDecimal(event.params.value, BI_18))
    toUserLiquidityPosition.save()
    createLiquiditySnapshot(toUserLiquidityPosition, event)
  }

  transaction.save()
}

export function handleSync(event: Sync): void {
  let pair = Pair.load(event.address.toHex())
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)
  let baguette = BaguetteFactory.load(FACTORY_ADDRESS)

  // reset factory liquidity by subtracting onluy tarcked liquidity
  baguette.totalLiquidityETH = baguette.totalLiquidityETH.minus(pair.trackedReserveETH as BigDecimal)

  // reset token total liquidity amounts
  token0.totalLiquidity = token0.totalLiquidity.minus(pair.reserve0)
  token1.totalLiquidity = token1.totalLiquidity.minus(pair.reserve1)

  pair.reserve0 = convertTokenToDecimal(event.params.reserve0, token0.decimals)
  pair.reserve1 = convertTokenToDecimal(event.params.reserve1, token1.decimals)

  if (pair.reserve1.notEqual(ZERO_BD)) pair.token0Price = pair.reserve0.div(pair.reserve1)
  else pair.token0Price = ZERO_BD
  if (pair.reserve0.notEqual(ZERO_BD)) pair.token1Price = pair.reserve1.div(pair.reserve0)
  else pair.token1Price = ZERO_BD

  pair.save()

  // update ETH price now that reserves could have changed
  let bundle = Bundle.load('1')
  bundle.ethPrice = getEthPriceInUSD()
  bundle.save()

  token0.derivedETH = findEthPerToken(token0 as Token)
  token1.derivedETH = findEthPerToken(token1 as Token)
  token0.save()
  token1.save()

  // get tracked liquidity - will be 0 if neither is in whitelist
  let trackedLiquidityETH: BigDecimal
  if (bundle.ethPrice.notEqual(ZERO_BD)) {
    trackedLiquidityETH = getTrackedLiquidityUSD(pair.reserve0, token0 as Token, pair.reserve1, token1 as Token).div(
      bundle.ethPrice
    )
  } else {
    trackedLiquidityETH = ZERO_BD
  }

  // use derived amounts within pair
  pair.trackedReserveETH = trackedLiquidityETH
  pair.reserveETH = pair.reserve0
    .times(token0.derivedETH as BigDecimal)
    .plus(pair.reserve1.times(token1.derivedETH as BigDecimal))
  pair.reserveUSD = pair.reserveETH.times(bundle.ethPrice)

  // use tracked amounts globally
  baguette.totalLiquidityETH = baguette.totalLiquidityETH.plus(trackedLiquidityETH)
  baguette.totalLiquidityUSD = baguette.totalLiquidityETH.times(bundle.ethPrice)

  // now correctly set liquidity amounts for each token
  token0.totalLiquidity = token0.totalLiquidity.plus(pair.reserve0)
  token1.totalLiquidity = token1.totalLiquidity.plus(pair.reserve1)

  // save entities
  pair.save()
  baguette.save()
  token0.save()
  token1.save()
}

export function handleMint(event: Mint): void {
  let transaction = Transaction.load(event.transaction.hash.toHexString())
  let mints = transaction.mints

  if (mints.length === 0) {
    return
  }

  let mint = MintEvent.load(mints[mints.length - 1])

  let pair = Pair.load(event.address.toHex())
  let baguette = BaguetteFactory.load(FACTORY_ADDRESS)

  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)

  // update exchange info (except balances, sync will cover that)
  let token0Amount = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let token1Amount = convertTokenToDecimal(event.params.amount1, token1.decimals)

  // update txn counts
  token0.txCount = token0.txCount.plus(ONE_BI)
  token1.txCount = token1.txCount.plus(ONE_BI)

  // get new amounts of USD and ETH for tracking
  let bundle = Bundle.load('1')
  let amountTotalUSD = token1.derivedETH
    .times(token1Amount)
    .plus(token0.derivedETH.times(token0Amount))
    .times(bundle.ethPrice)

  // update txn counts
  pair.txCount = pair.txCount.plus(ONE_BI)
  baguette.txCount = baguette.txCount.plus(ONE_BI)

  // save entities
  token0.save()
  token1.save()
  pair.save()
  baguette.save()

  mint.sender = event.params.sender
  mint.amount0 = token0Amount as BigDecimal
  mint.amount1 = token1Amount as BigDecimal
  mint.logIndex = event.logIndex
  mint.amountUSD = amountTotalUSD as BigDecimal
  mint.save()

  // update the LP position
  let liquidityPosition = createLiquidityPosition(event.address, mint.to as Address)
  createLiquiditySnapshot(liquidityPosition, event)

  // update day entities
  updatePairDayData(event)
  updatePairHourData(event)
  updateBaguetteDayData(event)
  updateTokenDayData(token0 as Token, event)
  updateTokenDayData(token1 as Token, event)
}

export function handleBurn(event: Burn): void {
  let transaction = Transaction.load(event.transaction.hash.toHexString())

  // safety check
  if (transaction === null) {
    return
  }

  let burns = transaction.burns
  let burn = BurnEvent.load(burns[burns.length - 1])

  let pair = Pair.load(event.address.toHex())
  let baguette = BaguetteFactory.load(FACTORY_ADDRESS)

  //update token info
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)
  let token0Amount = convertTokenToDecimal(event.params.amount0, token0.decimals)
  let token1Amount = convertTokenToDecimal(event.params.amount1, token1.decimals)

  // update txn counts
  token0.txCount = token0.txCount.plus(ONE_BI)
  token1.txCount = token1.txCount.plus(ONE_BI)

  // get new amounts of USD and ETH for tracking
  let bundle = Bundle.load('1')
  let amountTotalUSD = token1.derivedETH
    .times(token1Amount)
    .plus(token0.derivedETH.times(token0Amount))
    .times(bundle.ethPrice)

  // update txn counts
  baguette.txCount = baguette.txCount.plus(ONE_BI)
  pair.txCount = pair.txCount.plus(ONE_BI)

  // update global counter and save
  token0.save()
  token1.save()
  pair.save()
  baguette.save()

  // update burn
  // burn.sender = event.params.sender
  burn.amount0 = token0Amount as BigDecimal
  burn.amount1 = token1Amount as BigDecimal
  // burn.to = event.params.to
  burn.logIndex = event.logIndex
  burn.amountUSD = amountTotalUSD as BigDecimal
  burn.save()

  // update the LP position
  let liquidityPosition = createLiquidityPosition(event.address, burn.sender as Address)
  createLiquiditySnapshot(liquidityPosition, event)

  // update day entities
  updatePairDayData(event)
  updatePairHourData(event)
  updateBaguetteDayData(event)
  updateTokenDayData(token0 as Token, event)
  updateTokenDayData(token1 as Token, event)
}

export function handleSwap(event: Swap): void {
  // check if sender and dest are equal to the router
  // if so, change the to address to the tx issuer
  let dest: Address
  if (event.params.sender == Address.fromString(ROUTER_ADDRESS) && event.params.to == Address.fromString(ROUTER_ADDRESS)) {
    dest = event.transaction.from
  } else {
    dest = event.params.to
  }

  let pair = Pair.load(event.address.toHexString())
  let token0 = Token.load(pair.token0)
  let token1 = Token.load(pair.token1)
  let amount0In = convertTokenToDecimal(event.params.amount0In, token0.decimals)
  let amount1In = convertTokenToDecimal(event.params.amount1In, token1.decimals)
  let amount0Out = convertTokenToDecimal(event.params.amount0Out, token0.decimals)
  let amount1Out = convertTokenToDecimal(event.params.amount1Out, token1.decimals)

  // totals for volume updates
  let amount0Total = amount0Out.plus(amount0In)
  let amount1Total = amount1Out.plus(amount1In)

  // ETH/USD prices
  let bundle = Bundle.load('1')

  // get total amounts of derived USD and ETH for tracking
  let derivedAmountETH = token1.derivedETH
    .times(amount1Total)
    .plus(token0.derivedETH.times(amount0Total))
    .div(BigDecimal.fromString('2'))
  let derivedAmountUSD = derivedAmountETH.times(bundle.ethPrice)

  // only accounts for volume through white listed tokens
  let trackedAmountUSD = getTrackedVolumeUSD(amount0Total, token0 as Token, amount1Total, token1 as Token, pair as Pair)

  let trackedAmountETH: BigDecimal
  if (bundle.ethPrice.equals(ZERO_BD)) {
    trackedAmountETH = ZERO_BD
  } else {
    trackedAmountETH = trackedAmountUSD.div(bundle.ethPrice)
  }

  // update token0 global volume and token liquidity stats
  token0.tradeVolume = token0.tradeVolume.plus(amount0In.plus(amount0Out))
  token0.tradeVolumeUSD = token0.tradeVolumeUSD.plus(trackedAmountUSD)
  token0.untrackedVolumeUSD = token0.untrackedVolumeUSD.plus(derivedAmountUSD)

  // update token1 global volume and token liquidity stats
  token1.tradeVolume = token1.tradeVolume.plus(amount1In.plus(amount1Out))
  token1.tradeVolumeUSD = token1.tradeVolumeUSD.plus(trackedAmountUSD)
  token1.untrackedVolumeUSD = token1.untrackedVolumeUSD.plus(derivedAmountUSD)

  // update txn counts
  token0.txCount = token0.txCount.plus(ONE_BI)
  token1.txCount = token1.txCount.plus(ONE_BI)

  // update pair volume data, use tracked amount if we have it as its probably more accurate
  pair.volumeUSD = pair.volumeUSD.plus(trackedAmountUSD)
  pair.volumeToken0 = pair.volumeToken0.plus(amount0Total)
  pair.volumeToken1 = pair.volumeToken1.plus(amount1Total)
  pair.untrackedVolumeUSD = pair.untrackedVolumeUSD.plus(derivedAmountUSD)
  pair.txCount = pair.txCount.plus(ONE_BI)
  pair.save()

  // update global values, only used tracked amounts for volume
  let baguette = BaguetteFactory.load(FACTORY_ADDRESS)
  baguette.totalVolumeUSD = baguette.totalVolumeUSD.plus(trackedAmountUSD)
  baguette.totalVolumeETH = baguette.totalVolumeETH.plus(trackedAmountETH)
  baguette.untrackedVolumeUSD = baguette.untrackedVolumeUSD.plus(derivedAmountUSD)
  baguette.txCount = baguette.txCount.plus(ONE_BI)

  // save entities
  pair.save()
  token0.save()
  token1.save()
  baguette.save()

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.blockNumber = event.block.number
    transaction.timestamp = event.block.timestamp
    transaction.mints = []
    transaction.swaps = []
    transaction.burns = []
  }
  let swaps = transaction.swaps
  let swap = new SwapEvent(
    event.transaction.hash
      .toHexString()
      .concat('-')
      .concat(BigInt.fromI32(swaps.length).toString())
  )

  // update swap event
  swap.transaction = transaction.id
  swap.pair = pair.id
  swap.timestamp = transaction.timestamp
  swap.transaction = transaction.id
  swap.sender = event.params.sender
  swap.amount0In = amount0In
  swap.amount1In = amount1In
  swap.amount0Out = amount0Out
  swap.amount1Out = amount1Out
  swap.to = dest
  swap.from = event.transaction.from
  swap.logIndex = event.logIndex
  // use the tracked amount if we have it
  swap.amountUSD = trackedAmountUSD === ZERO_BD ? derivedAmountUSD : trackedAmountUSD
  swap.save()

  // update the transaction

  // TODO: Consider using .concat() for handling array updates to protect
  // against unintended side effects for other code paths.
  swaps.push(swap.id)
  transaction.swaps = swaps
  transaction.save()

  // update day entities
  let pairDayData = updatePairDayData(event)
  let pairHourData = updatePairHourData(event)
  let baguetteDayData = updateBaguetteDayData(event)
  let token0DayData = updateTokenDayData(token0 as Token, event)
  let token1DayData = updateTokenDayData(token1 as Token, event)

  // swap specific updating
  baguetteDayData.dailyVolumeUSD = baguetteDayData.dailyVolumeUSD.plus(trackedAmountUSD)
  baguetteDayData.dailyVolumeETH = baguetteDayData.dailyVolumeETH.plus(trackedAmountETH)
  baguetteDayData.dailyVolumeUntracked = baguetteDayData.dailyVolumeUntracked.plus(derivedAmountUSD)
  baguetteDayData.save()

  // swap specific updating for pair
  pairDayData.dailyVolumeToken0 = pairDayData.dailyVolumeToken0.plus(amount0Total)
  pairDayData.dailyVolumeToken1 = pairDayData.dailyVolumeToken1.plus(amount1Total)
  pairDayData.dailyVolumeUSD = pairDayData.dailyVolumeUSD.plus(trackedAmountUSD)
  pairDayData.save()

  // update hourly pair data
  pairHourData.hourlyVolumeToken0 = pairHourData.hourlyVolumeToken0.plus(amount0Total)
  pairHourData.hourlyVolumeToken1 = pairHourData.hourlyVolumeToken1.plus(amount1Total)
  pairHourData.hourlyVolumeUSD = pairHourData.hourlyVolumeUSD.plus(trackedAmountUSD)
  pairHourData.save()

  // swap specific updating for token0
  token0DayData.dailyVolumeToken = token0DayData.dailyVolumeToken.plus(amount0Total)
  token0DayData.dailyVolumeETH = token0DayData.dailyVolumeETH.plus(amount0Total.times(token1.derivedETH as BigDecimal))
  token0DayData.dailyVolumeUSD = token0DayData.dailyVolumeUSD.plus(
    amount0Total.times(token0.derivedETH as BigDecimal).times(bundle.ethPrice)
  )
  token0DayData.save()

  // swap specific updating
  token1DayData.dailyVolumeToken = token1DayData.dailyVolumeToken.plus(amount1Total)
  token1DayData.dailyVolumeETH = token1DayData.dailyVolumeETH.plus(amount1Total.times(token1.derivedETH as BigDecimal))
  token1DayData.dailyVolumeUSD = token1DayData.dailyVolumeUSD.plus(
    amount1Total.times(token1.derivedETH as BigDecimal).times(bundle.ethPrice)
  )
  token1DayData.save()
}
