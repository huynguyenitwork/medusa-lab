# workflow
* chuyển medusa 2.0.7 từ yarn sang pnpm thì nên chuẩn hóa theo thứ tự sau:
1. **root**
* đổi:
  ```json
  "packageManager": "pnpm@11.3.0"
  ```
* chỉ cần **1 chỗ ở root**.
1. **xóa hoàn toàn** trong các package con nếu có:
```json
"packageManager": "yarn@3.2.1"
```
2. thêm `pnpm-workspace.yaml` và bỏ `workspaces` trong `package.json`
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
}
```
3. chuyển toàn bộ dependency nội bộ từ:
```json
"@medusajs/framework": "2.0.7"
```
thành
```json
"@medusajs/framework": "workspace:*"
```
4. nếu có `peerDependencies` giữa các package nội bộ thì **không đổi**. chỉ đổi `dependencies`, `devDependencies`, `optionalDependencies`.
5. xóa sạch cache:
```bash
rm -rf node_modules
rm -rf pnpm-lock.yaml
pnpm install
```
6. **kiểm tra toàn bộ lifecycle scripts**
* rà soát các script:
  * `prepare`
  * `preinstall`
  * `install`
  * `postinstall`
* xác định script nào đang tự gọi `build`.
* vì `pnpm install` sẽ thực thi các lifecycle này.
7. **chuẩn hóa build workflow**
* `pnpm install` chỉ có nhiệm vụ:
  * resolve dependencies
  * link workspace packages
  * cài external packages
* không nên phụ thuộc vào việc `prepare` build toàn bộ monorepo.
8. **để Turbo điều phối build**
* giữ graph build trong `turbo.json`
* mỗi package chỉ khai báo:
  ```json
  "build": "..."
  ```
* chạy build bằng:
  ```bash
  pnpm exec turbo run build
  ```
* Turbo sẽ build theo dependency graph (`dependsOn: ["^build"]`).
9.  **kiểm tra graph build**
* verify workspace:
  ```bash
  pnpm -r list --depth -1
  ```
* verify graph:
  ```bash
  pnpm exec turbo run build --graph
  ```
* xác nhận package được build theo đúng thứ tự dependency.
10. **xử lý các package phụ thuộc vào output của package khác**
* nếu package import:
  ```text
  @medusajs/framework/types
  @medusajs/framework/utils
  @medusajs/framework/modules-sdk
  ```
* thì package cung cấp (`@medusajs/framework`) phải được build trước.
* không dựa vào `prepare` để đảm bảo thứ tự này.
### riêng `packageManager`
không khuyến khích để mỗi package con một `packageManager`.
monorepo chuẩn thường chỉ có:
```text
root/
 ├── package.json           <-- packageManager
 ├── pnpm-workspace.yaml
 └── packages/
      ├── framework/
      ├── medusa/
      └── ... 
```
# troubleshoot
## 1. `pnpm install` báo `failed to create bin ... dist/...`
### hiện tượng
```text
failed to create bin ...
enoent ... dist/.../bin.js
```
### nguyên nhân
`pnpm install` tạo executable (`bin`) cho workspace package nhưng package cung cấp chưa được build nên thư mục `dist` chưa tồn tại.
### xử lý
không build thủ công từng package.
sau khi `pnpm install` hoàn tất:
```bash
pnpm exec turbo run build
```
để turbo build theo dependency graph.
## 2. `ts2307: cannot find module '@medusajs/framework/*'`
### hiện tượng
```text
cannot find module '@medusajs/framework/types'
cannot find module '@medusajs/framework/utils'
```
### nguyên nhân
package đang import output của package khác nhưng package đó chưa được build.
### xử lý
không dùng `prepare` để build toàn bộ monorepo.
để turbo điều phối:
```bash
pnpm exec turbo run build
```
## 3. `ts2580: cannot find name 'module'`
### hiện tượng
```text
cannot find name 'module'
```
ví dụ:
```ts
module.exports = preset
```
### nguyên nhân
package sử dụng node globals nhưng không khai báo `@types/node`.
yarn có thể vô tình che giấu lỗi này, còn pnpm cô lập dependency nên lỗi được phát hiện.
### xử lý
thêm:
```json
"devdependencies": {
  "@types/node": "^20"
}
```
vào đúng package sử dụng `module`, sau đó:
```bash
pnpm install
pnpm --filter @medusajs/ui-preset build
pnpm exec turbo run build
```
## 4. `ts2322: type 'unknown' is not assignable to type 'string'`
### hiện tượng
```text
type 'unknown' is not assignable to type 'string'
```
### nguyên nhân
sau khi migrate hoặc cập nhật dependency, một số package có type chặt hơn (ví dụ `winston`, `triple-beam`, `typescript`). giá trị trước đây suy luận là `string` có thể trở thành `unknown`.
### xử lý
không tắt kiểm tra kiểu.
ép kiểu hoặc chuyển đổi rõ ràng:
```ts
string(value)
```
hoặc
```ts
value as string
```
sau khi xác nhận giá trị thực sự là chuỗi.
kiểm tra
```bash
pnpm --filter create-medusa-app build
pnpm exec turbo run build
```
