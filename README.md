[![npm version](https://badge.fury.io/js/multi-asset-transfer.svg)](https://badge.fury.io/js/multi-asset-transfer)
[![npm downloads](https://img.shields.io/npm/dm/multi-asset-transfer.svg)](https://www.npmjs.com/package/multi-asset-transfer)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

# Safe Multi Asset Transfer Library

Library for safe multi asset transfer.

## Installation

```bash
npm install multi-asset-transfer
```

## Usage

```ts
import { parseCsv } from 'multi-asset-transfer';

const transfer = safeTransfer({
  assets: [{
    assetId: 'assetId',
    amount: 100,

```