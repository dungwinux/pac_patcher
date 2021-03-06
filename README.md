# PAC Patcher

### Requirement

-   [Node.js](https://nodejs.org/)
-   [Kaitai Struct](http://kaitai.io/)
-   Node.js Global dependency
    -   [nexe](https://www.npmjs.com/package/nexe)
    -   [@vercel/ncc](https://www.npmjs.com/package/@vercel/ncc)
-   (Optional) [upx](https://upx.github.io/)

### Build instruction

-   `npm i`
-   `npm run build`
-   (Optional, reducing file size) `npm run compress`

#### Output: `dist/patch.exe`

### Run

-   Add modified `.srp` file to the same folder as `patch.exe`, keeping the original file name.
-   Execute `patch.exe srp.pac`.
-   (Not tested) Other files type inside PAC might as well patch-able.

### Hướng dẫn sử dụng

-   Cho các tệp .srp đã sửa đổi vào cùng folder của patch.exe (lưu ý: giữ nguyên tên gốc).
-   Kéo thả srp.pac vào patch.exe hoặc chạy `patch.exe srp.pac`.
-   (Chưa kiểm chứng) Chương trình cũng có thể sử dụng để patch những file khác.
