# ERC-721A Contract for EVM Networks

## Launch

### Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`
- `network` options: goerli_eth, testnet_canto
- To do: eth_mainnet and canto_mainnet

### Verifying

- `npx hardhat verify --network <NETWORK> --constructor-args scripts/arguments.ts <DEPLOYED_CONTRACT_ADDRESS>`
  - Command line only works with ethereum (mainent, goerli, etc)
  - Add custom setup in `hardhat.config.ts` for other chains
    - Manual verificatio: copy `input` field from `artifacts/build-info/`, paste into `input.json`
  - Verification on canto testnet currenly fails

### Gas Usage

#### Deployment

- Gas units: 1,821,361
- Cost:

  - 15 gwei: 0.027320415 eth
  - 30 gwei: 0.05464083 eth
  - 60 gwei: 0.10928166 eth

#### Minting

##### 1 Token

- Gas units:
- Cost:

  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

##### 5 Tokens

- Gas units:
- Cost:

  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

##### Transfer

- Gas units:
- Cost:
  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

## Testing

- `npx hardhat test` to test contracts
