## lệnh
```json
npx turbo run build --dry-run=json
```
## cây cấu trúc 

```txt
packages
├── admin
│   ├── admin-bundler
│   ├── admin-sdk
│   ├── admin-shared
│   ├── admin-vite-plugin
│   └── dashboard
├── cli
│   ├── create-medusa-app
│   ├── medusa-cli
│   └── medusa-dev-cli
├── core
│   ├── core-flows
│   ├── framework
│   ├── js-sdk
│   ├── modules-sdk
│   ├── orchestration
│   ├── types
│   ├── utils
│   └── workflows-sdk
├── design-system
│   ├── icons
│   ├── toolbox
│   ├── ui
│   └── ui-preset
├── medusa
│   ├── dist
│   ├── node_modules
│   └── src
├── medusa-telemetry
│   ├── dist
│   ├── node_modules
│   └── src
├── medusa-test-utils
│   ├── dist
│   ├── node_modules
│   └── src
└── modules
    ├── api-key
    ├── auth
    ├── cache-inmemory
    ├── cache-redis
    ├── cart
    ├── currency
    ├── customer
    ├── event-bus-local
    ├── event-bus-redis
    ├── file
    ├── fulfillment
    ├── index
    ├── inventory
    ├── link-modules
    ├── locking
    ├── notification
    ├── order
    ├── payment
    ├── pricing
    ├── product
    ├── promotion
    ├── providers
    ├── region
    ├── sales-channel
    ├── stock-location
    ├── store
    ├── tax
    ├── user
    ├── workflow-engine-inmemory
    └── workflow-engine-redis
```
## bảng

| wave | package                   | phụ thuộc trực tiếp                                                                                           | số package dùng nó |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------ |
| 0    | admin-shared              | —                                                                                                             | 4                  |
| 0    | medusa-dev-cli            | —                                                                                                             | 0                  |
| 0    | telemetry                 | —                                                                                                             | 4                  |
| 0    | toolbox                   | —                                                                                                             | 2                  |
| 0    | types                     | —                                                                                                             | 10                 |
| 1    | admin-sdk                 | admin-shared                                                                                                  | 0                  |
| 1    | admin-vite-plugin         | admin-shared                                                                                                  | 2                  |
| 1    | create-medusa-app         | telemetry                                                                                                     | 0                  |
| 1    | icons                     | toolbox                                                                                                       | 2                  |
| 1    | js-sdk                    | types                                                                                                         | 1                  |
| 1    | ui-preset                 | toolbox                                                                                                       | 2                  |
| 1    | utils                     | types                                                                                                         | 8                  |
| 2    | cli                       | telemetry, utils                                                                                              | 1                  |
| 2    | orchestration             | types, utils                                                                                                  | 3                  |
| 2    | ui                        | icons, ui-preset                                                                                              | 1                  |
| 3    | dashboard                 | admin-shared, admin-vite-plugin, icons, js-sdk, types, ui, ui-preset                                          | 1                  |
| 3    | modules-sdk               | orchestration, types, utils                                                                                   | 5                  |
| 4    | admin-bundler             | admin-shared, admin-vite-plugin, dashboard, types                                                             | 1                  |
| 4    | workflows-sdk             | modules-sdk, orchestration, types, utils                                                                      | 1                  |
| 5    | **framework**             | cli, modules-sdk, orchestration, telemetry, types, utils, workflows-sdk                                       | **44**             |
| 6    | auth-emailpass            | framework                                                                                                     | 1                  |
| 6    | auth-github               | framework                                                                                                     | 1                  |
| 6    | auth-google               | framework                                                                                                     | 1                  |
| 6    | cache-inmemory            | framework                                                                                                     | 4                  |
| 6    | cache-redis               | framework                                                                                                     | 1                  |
| 6    | core-flows                | framework                                                                                                     | 3                  |
| 6    | event-bus-local           | framework                                                                                                     | 4                  |
| 6    | event-bus-redis           | framework                                                                                                     | 1                  |
| 6    | file-local                | framework                                                                                                     | 1                  |
| 6    | file-s3                   | framework                                                                                                     | 1                  |
| 6    | fulfillment-manual        | framework                                                                                                     | 3                  |
| 6    | locking-postgres          | framework                                                                                                     | 1                  |
| 6    | locking-redis             | framework                                                                                                     | 1                  |
| 6    | notification-local        | framework                                                                                                     | 1                  |
| 6    | notification-sendgrid     | framework                                                                                                     | 1                  |
| 6    | payment-stripe            | framework                                                                                                     | 1                  |
| 6    | **test-utils**            | framework                                                                                                     | **27**             |
| 7    | api-key                   | framework, test-utils                                                                                         | 4                  |
| 7    | auth                      | framework, test-utils                                                                                         | 4                  |
| 7    | cart                      | framework, test-utils                                                                                         | 1                  |
| 7    | currency                  | framework, test-utils                                                                                         | 2                  |
| 7    | customer                  | framework, test-utils                                                                                         | 4                  |
| 7    | file                      | framework, test-utils                                                                                         | 1                  |
| 7    | fulfillment               | framework, test-utils                                                                                         | 3                  |
| 7    | index                     | framework, test-utils                                                                                         | 1                  |
| 7    | inventory                 | framework, test-utils                                                                                         | 3                  |
| 7    | link-modules              | framework, test-utils                                                                                         | 2                  |
| 7    | locking                   | framework, test-utils                                                                                         | 1                  |
| 7    | notification              | framework, test-utils                                                                                         | 1                  |
| 7    | order                     | framework, test-utils                                                                                         | 1                  |
| 7    | payment                   | framework, test-utils                                                                                         | 3                  |
| 7    | pricing                   | framework, test-utils                                                                                         | 4                  |
| 7    | product                   | framework, test-utils                                                                                         | 4                  |
| 7    | promotion                 | framework, test-utils                                                                                         | 4                  |
| 7    | region                    | framework, test-utils                                                                                         | 4                  |
| 7    | sales-channel             | framework, test-utils                                                                                         | 1                  |
| 7    | stock-location            | framework, test-utils                                                                                         | 3                  |
| 7    | store                     | framework, test-utils                                                                                         | 4                  |
| 7    | tax                       | framework, test-utils                                                                                         | 4                  |
| 7    | user                      | framework, test-utils                                                                                         | 4                  |
| 7    | workflow-engine-inmemory  | framework, test-utils                                                                                         | 4                  |
| 7    | workflow-engine-redis     | framework, test-utils                                                                                         | 1                  |
| 8    | **medusa**                | _toàn bộ 44 package ở wave 0–7 trừ dashboard/orchestration/etc, gồm admin-bundler + tất cả module ở wave 6-7_ | 3                  |
| 9    | integration-tests-api     | 17 package (chủ yếu wave 6-7 + medusa)                                                                        | 0                  |
| 9    | integration-tests-http    | 24 package (thêm test-utils, types trực tiếp)                                                                 | 0                  |
| 9    | integration-tests-modules | 27 package (nhiều nhất, gồm cả framework)                                                                     | 0                  |

**đọc nhanh:**

- **root thật sự**: `types`, `telemetry`, `toolbox`, `admin-shared` — không phụ thuộc gì, build trước tiên.
- **nút thắt cổ chai (bottleneck)**: `framework` (44 package chờ nó) và `test-utils` (27 package chờ nó) — build 2 cái này chậm là kéo dài toàn bộ pipeline.
- **cuối cùng**: `medusa` phải đợi gần hết monorepo xong, rồi 3 gói `integration-tests-*` đợi `medusa`.
