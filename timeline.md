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