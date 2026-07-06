# refactor
## yêu cầu
* xóa dữ liệu cũ
```bash
rm -rf node_modules .turbo .yarn .yarnrc.yml
git clean -xfd
```
* phiên bản cố định
```bash
# v20 LTS
node -v
# 3.2.1
yarn -v
# ?
yarn exec tsc --version
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