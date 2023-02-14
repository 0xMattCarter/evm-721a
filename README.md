# ERC-721A Contract for EVM Networks

## Launch

### Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`
- `npx hardhat run --network goerli_eth scripts/deploy.ts`
- `npx hardhat run --network testnet_canto scripts/deploy.ts`
- Todo: Mainnet (eth) and Canot (main)

### Verifying

- Commandline verification only works with Ethereum (mainent, goerli, etc)
  - Need custom setup in `hardhat.config.ts` for other chains
- For manual verification, copy the `input` field from `artifacts/build-info/` and put into `input.json` for upload
  - Currently verification on canto testnet fails
- `npx hardhat verify --network <NETWORK> --constructor-args scripts/arguments.ts <DEPLOYED_CONTRACT_ADDRESS>`

### Gas Usage

#### Deployment

- Gas units: 1,821,361
- Cost:
  - 15 gwei: 0.027320415 eth
  - 30 gwei: 0.05464083 eth
  - 60 gwei: 0.10928166 eth

#### Minting 1 Token

- Gas units:
- Cost:
  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

#### Minting 5 Tokens

- Gas units:
- Cost:
  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

#### Transfer

- Gas units:
- Cost:
  - 15 gwei: 0.xx eth
  - 30 gwei: 0.xx eth
  - 60 gwei: 0.xx eth

## Testing

- Run `npx hardhat test` to test contracts
