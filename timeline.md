# workflow
* chuyển medusa 2.0.7 từ yarn sang pnpm thì nên chuẩn hóa theo thứ tự sau:
1. **root**
   * đổi:
     ```json
     "packageManager": "pnpm@11.3.0"
     ```
   * chỉ cần **1 chỗ ở root**.
2. **xóa hoàn toàn** trong các package con nếu có:
   ```json
   "packageManager": "yarn@3.2.1"
   ```
3. thêm `pnpm-workspace.yaml`. và bỏ packages sau trong `package.json`
```json
"workspaces": {
  "packages": [
    "packages/medusa",
    "packages/medusa-test-utils",
    "packages/modules/*",
    "packages/modules/providers/*",
    "packages/core/*",
    "packages/framework/*",
    "packages/cli/*",
    "packages/cli/oas/*",
    "packages/*",
    "packages/admin/*",
    "packages/design-system/*",
    "packages/generated/*",
    "integration-tests/**/*"
  ]
},
```
4. chuyển toàn bộ dependency nội bộ từ:
   ```json
   "@medusajs/framework": "2.0.7"
   ```
   thành
   ```json
   "@medusajs/framework": "workspace:*"
   ```
5. nếu có `peerdependencies` giữa các package nội bộ thì **không đổi**. chỉ đổi `dependencies`, `devdependencies`, `optionaldependencies`.
6. xóa sạch cache:
   ```bash
   rm -rf node_modules
   rm -rf pnpm-lock.yaml
   pnpm install
   ```
### riêng `packageManager`
mình **không khuyến khích** để mỗi package con một `packageManager`.
monorepo chuẩn thường chỉ có:
```text
root/
 ├── package.json   <-- packageManager
 ├── pnpm-workspace.yaml
 └── packages/
      ├── framework/
      ├── medusa/
      └── ...
```
các package con chỉ là workspace, không cần khai báo package manager riêng.
đó cũng là cách giảm công bảo trì khi sau này nâng từ `pnpm@11` lên `pnpm@12`: bạn chỉ sửa **một file** ở root.
a