# refactor
## yêu cầu
* xóa dữ liệu cũ
```bash
rm -rf node_modules .turbo .yarn .yarnrc.yml .pnpm-store
rm yarn.lock
git clean -xfd
```
* thử nghiệm
```txt
medusa: 2.13.6
node.js: 20.19.4 lts
npm: 10.8.2
corepack: 0.32.x (hoặc bản đi kèm node 20.19.4)
pnpm: 9.15.9
```
* điều chỉnh role admin
```bash
mise use --global node@20.19.4
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

* kiểm tra
```bash
# v20.19.4
# 10.8.2
# 0.32.0
# 9.15.9
node -v && npm -v && corepack -v && pnpm -v
```

## 1. chạy install
```bash
yarn install --immutable
```
## 2. kiểm tra trước build
```bash
yarn exec tsc --version
yarn exec tsc-alias --version
yarn workspace @medusajs/locking-postgres build
```
## 3. chuyển đổi dùng pnpm
```bash
corepack prepare pnpm@10.15.0 --activate
pnpm import
rm yarn.lock 
rm -rf .yarn
rm -rf node_modules
```
sửa "packageManager": "pnpm@10.15.0"
đổi workspaces → pnpm-workspace.yaml (nếu cần)
đổi yarn thành pnpm không mù
```powershell
Get-ChildItem -Recurse -Filter package.json |
ForEach-Object {
    (Get-Content $_.FullName) -replace '\byarn\b','pnpm' |
    Set-Content $_.FullName
}
```
### 3.1 chuyển phiên bản typescript + @mikro-orm/core
* nguyên nhân
```bash
pnpm --filter @medusajs/link-modules build

yarn workspace @medusajs/link-modules build
```
* kiểm tra phiên bản
```bash
pnpm exec tsc --version
```
* cập nhật phiên bản 5.9.3 => 5.6.2 
```bash
pnpm install
```
* kiểm tra lại
```bash
pnpm list typescript -r
pnpm exec tsc --version
pnpm why @mikro-orm/core
pnpm list @mikro-orm/core -r
```
### 3.2 troubleshoot
#### 1. `ts2304: cannot find name 'filelist'` trong package @medusajs/types
* nếu package cần dùng DOM
```json
{
  "extends": "../../../_tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "ES2021",
      "DOM"
    ]
  }
}
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/types...
```
#### 2. @medusajs/types:build: src/dal/repository-service.ts(8,29): error TS2307: Cannot find module '@mikro-orm/core' or its corresponding type declarations.
* sửa
```bash
pnpm --filter @medusajs/types add @mikro-orm/core@5.9.7 
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/types...
```
#### 3. create-medusa-app:build: src/utils/logger.ts(4,42): error TS2322: Type 'unknown' is not assignable to type 'string'.
* sửa
```ts
value as string
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=create-medusa-app...
```
#### 4. @medusajs/ui-preset:build: src/index.ts(3,1): error TS2580: Cannot find name 'module'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
* sửa
```ts
pnpm --filter @medusajs/ui-preset add -D @types/node@20.12.10
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/ui-preset...
```

#### 5.@medusajs/utils:build: src/totals/big-number.ts(10,24): error TS2749: 'BigNumberJS' refers to a value, but is being used as a type here. Did you mean 'typeof BigNumberJS'?
* sửa
```ts
pnpm --filter @medusajs/types remove bignumber.js
pnpm --filter @medusajs/types add bignumber.js@9.1.2

pnpm --filter @medusajs/utils remove bignumber.js
pnpm --filter @medusajs/utils add bignumber.js@9.1.2

pnpm --filter @medusajs/utils add -D @types/jest@29.5.12
// pnpm --filter @medusajs/utils installl
```
* kiểm trav
```bash
pnpm --filter @medusajs/utils why bignumber.js
pnpm exec turbo build --no-daemon --filter=@medusajs/utils...
```

#### 6. `ts2304: cannot find name 'filelist'` trong package @@medusajs/js-sdk
* sửa
```json
{
  "extends": "../../../_tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "ES2021",
      "DOM"
    ]
  }
}
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/js-sdk...
```
#### 7. @medusajs/js-sdk:build: src/client.ts(46,35): error TS2339: Property 'entries' does not exist on type 'Headers'
* sửa
```json
{
  "extends": "../../../_tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "ES2021",
      "DOM",
      "DOM.Iterable"
    ]
  }
}
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/js-sdk...
```
#### 8. @medusajs/framework:build: src/http/utils/get-query-config.ts(8,22): error TS2307: Cannot find module 'lodash' or its corresponding type declarations. @medusajs/framework:build: src/http/utils/http-compression.ts(1,25): error TS2307: Cannot find module 'compression' or its corresponding type declarations.
* sửa
```bash
pnpm --filter @medusajs/framework add lodash@4.17.21 compression@1.7.4 
   
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/framework...
```
#### 9. @medusajs/locking-postgres:build: 'tsc-alias' is not recognized as an internal or external command,
* sửa
```bash
pnpm --filter @medusajs/locking-postgres add -D tsc-alias@1.8.8 
   
```
* kiểm tra
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/locking-postgres...
```

#### 10. @medusajs/ui:build: src/components/date-picker/date-picker.tsx(190,17): error TS2322: Type '(value: TimeValue) => void' is not assignable to type '(value: TimeValue | null) => void'.
* sửa
```bash
pnpm --filter @medusajs/ui add -D tslib@2.6.2 
pnpm --filter @medusajs/ui add @internationalized/date@3.5.4 

pnpm --filter @medusajs/ui add react-aria@3.33.1 react-stately@3.31.1
pnpm --filter @medusajs/ui remove react-aria react-stately sonner
pnpm --filter @medusajs/ui remove @internationalized/date@3.12.2

pnpm --filter @medusajs/ui add sonner@1.5.0

```
* kiểm tra
```bash
pnpm exec turbo build --concurrency=1 --no-daemon --filter=@medusajs/ui...
pnpm --filter @medusajs/ui why @internationalized/date react-aria react-stately sonner
pnpm --filter @medusajs/ui list @react-aria/calendar -r

pnpm --filter @medusajs/ui @react-aria/calendar @react-aria/i18n

yarn workspace @medusajs/ui why react-aria
yarn workspace @medusajs/ui why @internationalized/date
yarn workspace @medusajs/ui why react-stately
```


### 3.3 build
```bash
pnpm exec turbo build --no-daemon
pnpm exec turbo build --concurrency=1 --no-daemon 
pnpm build 
pnpm exec turbo build --no-daemon --filter=<package>...
pnpm --filter=<package> build
```


pnpm --filter @medusajs/ui why sonner