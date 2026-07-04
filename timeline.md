# workflow
* chuyển medusa 2.0.7 từ yarn sang pnpm thì nên chuẩn hóa theo thứ tự sau:
0. **root**
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
## 3. `ts2580: cannot find name 'module'` trong package @medusajs/ui-preset
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
## 4. `ts2322: type 'unknown' is not assignable to type 'string'` trong package create-medusa-app
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
## 5. `ts2582: cannot find name 'describe' / 'it' / 'test'` trong package @medusajs/types
### hiện tượng
```text
cannot find name 'describe'
cannot find name 'it'
cannot find name 'test'
```
thường xuất hiện khi build package chứa file `*.spec.ts`.
### nguyên nhân
typescript đang compile luôn các file test nhưng môi trường build không có type của test runner (`vitest`, `jest`, `mocha`...).
thường xảy ra khi:
* `tsconfig.build.json` include nhầm `**/*.spec.ts`
* hoặc package thiếu `@types/jest` / `vitest`
* hoặc sau khi migrate, cấu hình build thay đổi.
### xử lý
**nếu test không phải một phần của build**
loại khỏi build:
```json
{
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}
```
**nếu build cần compile test**
cài đúng type:
```bash
pnpm add -D @types/jest
```
### kiểm tra
```bash
pnpm --filter @medusajs/types build
```
## 6. `ts2307: cannot find module '@mikro-orm/core'` trong package @medusajs/types
### hiện tượng
```text
cannot find module '@mikro-orm/core'
```
### nguyên nhân
typescript tìm thấy import nhưng package chưa được cài hoặc workspace chưa link đúng.
thường xảy ra khi:
* chuyển dependency sang `workspace:*`
* package chưa build
* thiếu dependency trong `package.json`
### xử lý
kiểm tra package có tồn tại
```bash
pnpm --filter @medusajs/types why @mikro-orm/core
```
nếu không có
```json
"@mikro-orm/core": "5.9.7"
```
### kiểm tra
```bash
pnpm install
pnpm --filter @medusajs/types build
```


## 7. `ts2304: cannot find name 'filelist'` trong package @medusajs/types
### hiện tượng
```text
cannot find name 'FileList'
```
### nguyên nhân
`FileList` thuộc DOM API.
project đang compile bằng tsconfig không có thư viện `dom`.
thường xảy ra khi package được build trong môi trường node.
### xử lý
nếu package cần dùng DOM
```json
{
  "extends": "../../../_tsconfig.base.json",
  "compilerOptions": {
    "lib": [
      "ES2022",
      "DOM"
    ]
  }
}
```
nếu package chỉ chạy trên node thì nên thay `FileList` bằng kiểu riêng hoặc tránh phụ thuộc DOM.
### kiểm tra
```bash
pnpm --filter @medusajs/types build
```
## 8. `ts2304: cannot find name 'window' / 'requestinfo' / 'response'` trong package `@medusajs/js-sdk`
### hiện tượng
```text
cannot find name 'window'
cannot find name 'RequestInfo'
cannot find name 'Response'
cannot find name 'FileList'
```
### nguyên nhân
package sử dụng Web API nhưng `tsconfig` chỉ khai báo
```json
"lib": [
  "ES2021"
]
```
nên TypeScript không nạp các kiểu của DOM.
thường xảy ra khi:
* package browser kế thừa tsconfig dùng cho node.
* migrate sang tsconfig chung chỉ còn `ES2021`.
### xử lý
bổ sung DOM, dùng iterator của DOM thì thêm
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
### kiểm tra
```bash
pnpm --filter @medusajs/js-sdk build
```
## 9. `ts2304: cannot find name 'expect' / 'jest' / 'beforeall' / 'afterall'` trong package `@medusajs/js-sdk`
### hiện tượng
```text
cannot find name 'describe'
cannot find name 'it'
cannot find name 'expect'
cannot find name 'jest'
cannot find name 'beforeAll'
cannot find name 'afterEach'
```
### nguyên nhân
TypeScript đang compile các file test nhưng không có type của Jest.
khác với package `types`, ở đây còn xuất hiện
* `expect`
* `jest`
* `beforeAll`
* `afterEach`
=> gần như chắc chắn test đang dùng **Jest**.
### xử lý
nếu test không phải một phần của build
```json
{
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}
```
nếu build cần compile test
```json
"@types/jest": "^30.0.0",
```
### kiểm tra
```bash
pnpm --filter @medusajs/js-sdk build
```
## 10. `ts2322: type 'unknown' is not assignable to type 'response'` trong package `@medusajs/js-sdk`
### hiện tượng
```text
Type 'unknown' is not assignable to type 'Response'
```
hoặc
```text
Type '(...) => Promise<unknown>' is not assignable to type 'ClientFetch'
```
### nguyên nhân
sau khi cập nhật TypeScript hoặc thay đổi type của `fetch`, giá trị trả về được suy luận là `Promise<unknown>` thay vì `Promise<Response>`.
thường xảy ra khi:
* thiếu DOM typings.
* type của `fetch` thay đổi.
* generic bị mất trong quá trình migrate.
### xử lý
ưu tiên xử lý lỗi DOM trước.
nếu vẫn còn lỗi thì ép kiểu rõ ràng
```ts
return fetch(...) as Promise<Response>
```
hoặc
```ts
const response: Response = await fetch(...)
```
không nên dùng `any`.
### kiểm tra
```bash
pnpm --filter @medusajs/js-sdk build
```
## 11. `ts2582: cannot find name 'describe' / 'it' / 'test'` trong package `@medusajs/utils`
### hiện tượng
```text
cannot find name 'describe'
cannot find name 'it'
cannot find name 'test'
cannot find name 'expect'
cannot find name 'jest'
```
### nguyên nhân
TypeScript đang compile luôn các file test nhưng môi trường build không có type của Jest.
thường xảy ra khi:
* `tsconfig.build.json` include `**/*.spec.ts`
* package thiếu `@types/jest`
* cấu hình build thay đổi sau khi migrate.
### xử lý
nếu test không phải một phần của build
```json
{
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts",
    "**/__tests__/**"
  ]
}
```
nếu build cần compile test
```json
"@types/jest": "^30.0.0",
```
### kiểm tra
```bash
pnpm --filter @medusajs/utils build
```
## 12. `ts2339: property 'tobecalledtimes' does not exist` trong package `@medusajs/utils`
### hiện tượng
```text
Property 'toBeCalledTimes' does not exist on type 'JestMatchers<...>'
```
### nguyên nhân
đây **không phải** do thiếu `@types/jest`.
`expect()` và `JestMatchers<>` đã được TypeScript nhận diện.
nguyên nhân là version typings của Jest không còn hỗ trợ các alias cũ như:
```ts
toBeCalled()
toBeCalledTimes()
toBeCalledWith()
toReturn()
```
thường xảy ra khi:
- nâng version `@types/jest`
- hoặc typings của Jest thay đổi.
### xử lý
đổi sang API chính thức:
```ts
expect(fn).toHaveBeenCalled()
```
* toBeCalledTimes(1) đổi sang toHaveBeenCalledTimes(1)
```ts
expect(fn).toHaveBeenCalledTimes(3)
```
```ts
expect(fn).toHaveBeenCalledWith(...)
```
không nên tiếp tục sử dụng các alias cũ.
### kiểm tra
```bash
pnpm --filter @medusajs/utils build
```
## 13. `ts2304: cannot find name 'expect' / 'jest'` trong package `@medusajs/utils`
### hiện tượng
```text
Cannot find name 'expect'
Cannot find name 'jest'
Cannot find name 'describe'
Cannot find name 'it'
```
### nguyên nhân
typescript đang compile các file test nhưng chưa nạp type của jest.
```json
"@types/jest": "^30.0.0"
```
thường xảy ra khi `tsconfig.json` không khai báo:
```json
{
  "compilerOptions": {
    "types": [
      "@types/jest"
    ]
  }
}
```
### xử lý
bổ sung cấu hình:
```json
{
  "extends": "../../../_tsconfig.base.json",
  "compilerOptions": {
    "types": [
      "@types/jest"
    ]
  }
}
```
(`"jest"` và `"@types/jest"` đều hoạt động, nhưng `"jest"` là cách được TypeScript sử dụng phổ biến hơn.)
### kiểm tra
```bash
pnpm --filter @medusajs/utils exec tsc --showConfig
```
đảm bảo kết quả có:
```json
{
  "compilerOptions": {
    "types": [
      "@types/jest"
    ]
  }
}
```
## 14. `ts2749: 'bignumberjs' refers to a value, but is being used as a type` trong package `@medusajs/utils`
### hiện tượng
```text
'BigNumberJS' refers to a value, but is being used as a type.
Did you mean 'typeof BigNumberJS'?
```
### nguyên nhân
sau khi cập nhật `bignumber.js`, `BigNumberJS` không còn được dùng trực tiếp như một type.
ví dụ:
```ts
import BigNumberJS from "bignumber.js"
private value: BigNumberJS
```
TypeScript sẽ báo lỗi vì `BigNumberJS` là value, không phải type.
### xử lý
nếu package export type:
```ts
import BigNumberJS, { BigNumber } from "bignumber.js"
private value: BigNumber
```
hoặc
```ts
import BigNumberJS from "bignumber.js"
private value: InstanceType<typeof BigNumberJS>
```
chỉ sử dụng `typeof BigNumberJS` khi thực sự cần type của constructor.
### kiểm tra
```bash
pnpm --filter @medusajs/utils build
```
## 15. @medusajs/ui thiếu phụ thuộc
* dependencies
```json
"tslib": "^2.8.1",
"@internationalized/date" : "^3.12.2",
```
* kiểm tra
```bash
pnpm --filter @medusajs/ui why tslib
pnpm --filter @medusajs/ui why @internationalized/date
pnpm --filter @medusajs/ui why react-aria
pnpm --filter @medusajs/ui why react-stately
pnpm --filter @medusajs/ui why @react-types/shared
pnpm --filter @medusajs/ui why sonner
pnpm view react-aria@3.33.1 dependencies
pnpm --filter @medusajs/ui build
```
## troubleshoot loop
1. @medusajs/orchestration giống #13 + #12
```bash
pnpm --filter @medusajs/orchestration build
```

# check build
* test lỗi
```bash
pnpm --filter @medusajs/workflows-sdk build
```
* test từ lỗi trở đi phụ thuộc sau
```bash
pnpm exec turbo build --no-daemon --filter=@medusajs/workflows-sdk...
```
* test lại toàn bộ
```bash
pnpm exec turbo build --no-daemon
```
## done
@medusajs/admin-shared
@medusajs/toolbox
@medusajs/telemetry
medusa-dev-cli
@medusajs/types
create-medusa-app
@medusajs/ui-preset
@medusajs/icons
@medusajs/admin-sdk
@medusajs/admin-vite-plugin
@medusajs/utils
@medusajs/modules-sdk
## fail
@medusajs/workflows-sdk
## todo
@medusajs/ui
@medusajs/dashboard
@medusajs/admin-bundler

## resolve
### @medusajs/utils
```bash
pnpm --filter=@medusajs/utils why typescript
pnpm --filter=@medusajs/utils why jest
pnpm --filter=@medusajs/utils why @types/jest
pnpm --filter=@medusajs/utils why @types/node
pnpm --filter=@medusajs/utils why ts-jest
```
* chốt @types/jest và @types/node
### @medusajs/modules-sdk + @medusajs/workflows-sdk
* package.json
```json
"@types/jest": "29.5.12"
```
* tsconfig.json
```json
"compilerOptions": {
  "types": [
    "@types/jest"
  ]
}
```
* lọc và sửa toàn bộ package nào chứa `"jest": "29.7.0"` và có `tsconfig.json` mở rộng dùng chung với `root`
```json
"@types/jest": "29.5.12"
```