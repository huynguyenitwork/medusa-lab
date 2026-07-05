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