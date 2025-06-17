# 3Dpass to EVM Address Converter

The app allows for an easy conversion of 3Dpass substrate-based SS58 address to EVM H160 format and vice versa.

## Networks Support
The converter supports both mainnet and testnet:
- 3Dpass - The Ledger of Things Mainnet (SS58 prefix: 71)
- 3Dpass - The Ledger of Things Testnet (SS58 prefix: 72)

<img width="780" alt="3dpass-evm-address-converter-min" src="https://github.com/user-attachments/assets/a2cd0011-1e99-4065-9137-17c4d8fc7864" />


## Address Mapping

There is an EVM compatibility layer operating on The Ledger of Things (LoT) to ensure Solidity smart contracts seamless execution. The EVM accounts are standard `H160` addresses (20 bytes), while the native accounts are using the `H256` format (32 bytes).

### Conversion Logic

The conversion between native and EVM addresses is implemented using the libraries (`@polkadot/util` and `@polkadot/util-crypto`).

#### H256 to H160 Mapping (Native to EVM)
The conversion from native `H256` to EVM `H160` is straightforward:
1. The native public key (32 bytes) is truncated to 20 bytes by taking the first 20 bytes
2. The resulting 20 bytes are converted to a hex string with '0x' prefix

Example:
```
Native H256: 0xc6006fea43ccce14f9432f8e6b9403113c935cc17160cd438af2e7a02624124c
SS58: d1GjLAyfV83DefL1z1HpJwuXxWJhD3PHUArFgaZsKn321pUK4

Maps to EVM H160: 0xc6006fea43ccce14f9432f8e6b9403113c935cc1
```

This approach ensures that the original public key owner maintains full control while accessing both systems: Native runtime and EVM.

#### H160 to H256 Mapping (EVM to Native)
The conversion from EVM `H160` to native `H256` is more complex due to the information loss in the original truncation. Since we can't recover the original 32-byte key from a 20-byte address, a deterministic mapping is used:

1. The EVM address (20 bytes) is validated using `isEthereumAddress` check
2. The address is then processed through the `evmToAddress` function which:
   - Takes the EVM address and prepends it with a specific prefix (0x000000000000000000000000)
   - Applies the `Blake2b` hash function to generate a 32-byte output
   - The resulting hash is used as the new public key
   - This new key is different from the original one but maintains a consistent mapping
   - The resulting key is encoded in SS58 format with the appropriate network prefix (`71` for mainnet, `72` for testnet)

Example:
```
EVM H160: 0xc6006fea43ccce14f9432f8e6b9403113c935cc1

Maps to Native H256: 0xceb75620b9f3bc3a039b8e78efed58fa3c7422d18c97f1fd44abf3f2499d0760
SS58: d1GvktUdvKdghY7LB2zW2XDp1Wzio9ZPGGFcyaYhp2Nasy5LS
```

The mapped native account is a system address that allows receiving funds and executing transactions on behalf of the `H160` address within the native runtime. However, the EVM address owner doesn't have access to the mapped `H256` address private key and can only interact with EVM logic.
