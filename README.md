# ERC-721A Contract for EVM Networks

## Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`

### Examples:

- `npx hardhat run --network goerli_eth scripts/deploy.ts`
- `npx hardhat run --network testnet_canto scripts/deploy.ts`
- Todo: Mainnet (eth) and Canot (main)

## Verifying

- `npx hardhat verify --network <NETWORK> --constructor-args scripts/arguments.ts <DEPLOYED_CONTRACT_ADDRESS>`

- Commandline verification only works with Ethereum (mainent, goerli, etc)
  - Need custom setup in `hardhat.config.ts` for other chains
- For manual verification, copy the `input` field from `artifacts/build-info/` and put into `input.json` for upload
  - Currently verification on canto testnet fails

## Gas breakdown

### Deployment

- Gas units: 1,821,361
- Cost:
  gwei eth
  - 15 0.027320415
  - 30 0.05464083
  - 60 0.10928166

### Mint

#### 1 Token

- Gas units:
- Cost:
  gwei eth
  15: xxx
  30: xxx
  60: xxx

#### 2 Tokens

- Gas units:
- Cost:
  gwei eth
  15: xxx
  30: xxx
  60: xxx

## Testing

- Run `npx hardhat test` to test contracts
