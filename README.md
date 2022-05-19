# PAC Patcher

### Requirement

- [Node.js](https://nodejs.org/)
- [Kaitai Struct](http://kaitai.io/)
- (Optional) [upx](https://upx.github.io/)

### Build instruction

- `npm i`
- `npm run build`
- (Optional, reducing file size) `npm run build`

### Hướng dẫn sử dụng

- Cho các tệp .srp đã sửa đổi vào cùng folder của patch.exe (lưu ý: giữ nguyên tên gốc)
- Kéo thả srp.pac vào patch.exe hoặc chạy `patch.exe srp.pac`
- (Chưa kiểm chứng) Chương trình cũng có thể sử dụng để patch những file khác.