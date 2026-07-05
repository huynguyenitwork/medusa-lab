# verify
## muốn
* chuyển toàn bộ dự án từ yarn sang pnpm.
* tạo một cây dependency có thể tái tạo (reproducible).
* loại bỏ toàn bộ `^` và `~` trong workspace của mình.
* biết chính xác package nào đang kéo dependency nào.
* đảm bảo build trước và sau khi chuyển không thay đổi.
* tạo quy trình có thể áp dụng cho mọi dự án sau này.
## tin
### niềm tin
* `pnpm` phù hợp hơn yarn nếu muốn kiểm soát dependency.
* version cố định giúp giảm rủi ro build khác nhau giữa các máy.
* không nên thay đổi nhiều thứ cùng lúc.
* mọi thay đổi đều phải có bước xác thực.
### giả thuyết
* medusa 2.0.7 vẫn build được hoàn toàn bằng pnpm.
* lock toàn bộ dependency sẽ không làm thay đổi runtime nếu lockfile được tạo đúng.
* phần lớn lỗi nếu có sẽ đến từ:
  * peerdependencies
  * workspace
  * scripts
  * package manager khác nhau
## thử
### kiểm tra
tôi sẽ chia thành **8 pha**. mỗi pha chỉ thay đổi **một biến**.
# pha 0 — tạo baseline
**mục tiêu**
biết trạng thái hiện tại.
**làm**
```text
git checkout medusa-2.0.7
git status
```
build
```text
yarn install
yarn build
yarn test
```
lưu lại
* build log
* test
* checksum output nếu có
**kết quả mong muốn**
✅ build sạch.
nếu chưa sạch thì **không chuyển pnpm**.
# pha 1 — chuyển package manager
**chỉ thay đổi**
yarn → pnpm
không sửa package.json.
không sửa version.
không sửa dependency.
**làm**
xóa
```text
node_modules
.yarn
.yarnrc.yml
yarn.lock
```
sinh
```text
pnpm-lock.yaml
```
build.
**nếu lỗi**
=> lỗi do package manager.
không phải version.
# pha 2 — kiểm tra workspace
**kiểm tra**
```text
pnpm -r install
pnpm -r build
pnpm -r test
```
xem package nào:
* không khai báo dependency
* rely vào hoisting
đây là lỗi rất hay gặp khi chuyển từ yarn.
# pha 3 — freeze
bây giờ mới bắt đầu sửa
```json
"^"
"~"
```
thành
```json
"x.y.z"
```
**chỉ sửa**
workspace của bạn.
không sửa package trong node_modules.
ví dụ
```json
{
  "react": "18.3.1"
}
```
# pha 4 — sinh lockfile mới
```text
pnpm install
```
commit
```text
pnpm-lock.yaml
```
từ đây
không bao giờ
```text
pnpm install --no-frozen-lockfile
```
trên ci.
# pha 5 — audit dependency
lúc này mới bắt đầu phân tích.
ví dụ
```text
pnpm why react
pnpm why zod
pnpm why tsup
```
mỗi package hỏi:
* ai kéo nó?
* có dùng trực tiếp không?
* có thể bỏ không?
lập bảng.
| package | direct | transitive | cần | ghi chú |
| ------- | ------ | ---------- | --- | ------- |
# pha 6 — dependency graph
sinh graph.
ví dụ
```text
pnpm list --depth infinity
```
hoặc
```text
pnpm why
```
mục tiêu:
biết
```text
medusa
↓
framework
↓
sdk
↓
abc
↓
xyz
```
không đoán.
# pha 7 — chuẩn hóa
thêm
```json
packagemanager
```
```json
{
    "packagemanager": "pnpm@10.15.0"
}
```
thêm
```text
.nvmrc
```
ví dụ
```text
22.17.0
```
ci
```text
pnpm install --frozen-lockfile
```
# pha 8 — đóng băng
tag
```text
v2.0.7-company.0
```
từ đây
không update.
muốn update
tạo branch
```text
upgrade/*
```
## xác thực
### pha 0
**tiêu chí**
* build thành công
* test thành công
### pha 1
**tiêu chí**
* đổi sang pnpm
* không sửa source
* output giống pha 0
nếu khác
=> lỗi do package manager.
### pha 2
**tiêu chí**
không còn package rely vào hoisting.
### pha 3
**tiêu chí**
không còn
```text
^
~
```
trong package của bạn.
### pha 4
**tiêu chí**
sinh đúng
```text
pnpm-lock.yaml
```
### pha 5
**tiêu chí**
biết chính xác
* package nào dùng
* package nào thừa
### pha 6
**tiêu chí**
có dependency graph.
không còn suy đoán.
### pha 7
**tiêu chí**
máy a
máy b
ci
đều dùng cùng
* node
* pnpm
* lockfile
### pha 8
**tiêu chí**
có thể clone project mới và chạy:
```text
pnpm install --frozen-lockfile
pnpm build
```
mà không phát sinh thay đổi nào trong lockfile.
## chốt
* **quyết định:** không chuyển tất cả cùng lúc. mỗi pha chỉ thay đổi **một biến**, sau đó build và xác thực ngay. điều này giúp khi có lỗi, bạn biết chính xác nguyên nhân nằm ở package manager, version hay dependency.
* **hành động tiếp theo:** bắt đầu từ **pha 0** và **pha 1**. chỉ khi việc chuyển từ yarn sang pnpm hoàn toàn ổn định, mới chuyển sang việc cố định (`^`/`~`) toàn bộ phiên bản. đây là cách giảm rủi ro và giúp quá trình kiểm chứng có giá trị.
