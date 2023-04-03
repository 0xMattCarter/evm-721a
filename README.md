# ERC-721A Contract for EVM Networks

## Launch

### Deploy:

- `npx hardhat run --network <network> scripts/deploy.ts`
- see `hardhat.config.ts` for network options

### Verifying

- Needs to be done manually, the `npx hardhat verify ...` commandline task is buggy with l2s

  - Copy `input` field from latest build in `./artifacts/build-info/` to `./input.json`

## Testing

- `npx hardhat test` to test contracts
