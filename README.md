# ERC-721A Contract for EVM Networks

## Deployment:

### Deploying using hardhat

- `npx hardhat run --network <network> scripts/deploy.ts`

#### Examples:

- `npx hardhat run --network goerli_eth scripts/deploy.ts`
- `npx hardhat run --network testnet_canto scripts/deploy.ts`
- Todo: Mainnet (eth) and Canot (main)

### Verifying using hardhat

- `npx hardhat verify --network <NETWORK> --constructor-args scripts/arguments.ts <DEPLOYED_CONTRACT_ADDRESS>`

#### Notes:

- Only works with Ethereum (mainent, goerli, etc)
- Need custom setup in `hardhat.config.ts` to use commandline
- Moving the field `input` from `artifacts/build-info/` -> `input.json` should work for contract verification
- Currently verification on Canto testnet fails

## Gas usage

### Deployment

- Gas units: 1,821,361
- Range:

  - 15 gwei: 0.027320415 eth
  - 30 gwei: 0.05464083 eth
  - 60 gwei: 0.10928166 eth

### Mint

    - 1 Token
        - Gas units:
            - Range:

                - 15 gwei:
                - 60 gwei:
                - 60 gwei:
    - 2 Tokens
        - Gas units:
            - Range:

                - 15 gwei:
                - 60 gwei:
                - 60 gwei:

## Notes

- Run `npx hardhat test` to test contracts
