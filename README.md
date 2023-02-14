# ERC-721A Contract for EVM Networks

## Launch

### Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`
- network options: goerli_eth, testnet_canto
- to do: eth_mainnet and canto_mainnet

### Verifying

- `npx hardhat verify --network <NETWORK> --constructor-args scripts/arguments.ts <DEPLOYED_CONTRACT_ADDRESS>`
  - command line only works with ethereum (mainent, goerli, etc)
  - add custom setup in `hardhat.config.ts` for other chains
    - manual verificatio: copy `input` field from `artifacts/build-info/`, paste into `input.json`
  - verification on canto testnet currenly fails

### Gas Usage

#### Deployment

- gas units: 1,821,361
- cost:

  - 15 gwei: 0.027320415 eth
  - 30 gwei: 0.05464083 eth
  - 60 gwei: 0.10928166 eth

#### Minting

##### 1 Token

- gas units:
- cost:

  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

##### 5 Tokens

- gas units:
- cost:

  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

##### Transfer

- gas units:
- cost:
  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

## Testing

- `npx hardhat test` to test contracts
