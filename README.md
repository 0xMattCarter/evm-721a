# ERC-721A Contract for EVM Networks

## Launch

### Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`
- see `hardhat.config.ts` for network options

### Verifying

- Needs to be done manually, the `npx hardhat verify ...` commandline task is buggy with l2s

  - Copy `input` field from latest build in `./artifacts/build-info/` to `./input.json`

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
