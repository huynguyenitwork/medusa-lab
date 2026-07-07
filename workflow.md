## flow
```txt
git sạch
      │
      ▼
yarn install
      │
      ▼
yarn build
      │
      ▼
tag baseline
      │
      ▼
khóa version (^ → exact)
      │
      ▼
yarn install
      │
      ▼
yarn build
      │
      ▼
tạo cache đầy đủ (.yarn/cache)
      │
      ▼
kiểm tra offline install
      │
      ▼
kiểm tra build offline
      │
      ▼
cắt từng package một
      │
      ▼
sau mỗi lần cắt:
install → build → commit
      │
      ▼
khi repo ổn định mới migrate sang pnpm
      │
      ▼
tạo pnpm store
      │
      ▼
kiểm tra pnpm --offline
```