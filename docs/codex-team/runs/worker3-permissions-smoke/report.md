**CHƯA KIỂM CHỨNG — đã dừng probe khi MCP khởi tạo thất bại.**

Lỗi nguyên văn:

```text
Error: async initializeServer: Socket directory path is too long (125 chars); set PWTEST_SOCKETS_DIR to a shorter location.
```

| ID / severity | Trang / steps | Evidence / source paragraph | Tác động dạy/học / acceptance |
|---|---|---|---|
| W3-SMOKE-01 / Blocker kiểm thử | Gọi `browser_navigate` tới `http://localhost:3001/hoc-lieu` | MCP trả lỗi trên. Bài báo P67–68, P197–199 | Chưa xác nhận thao tác UI. Đóng khi browser mở trang, bộ lọc đổi trạng thái và lưu được ảnh. |

URL trước/sau **chưa xác nhận**; chưa click bộ lọc; ảnh `smoke-worker3.png` **chưa được tạo**.

Đã lưu [log thao tác](tmp/codex-team/worker-3/worker3-permissions-smoke/browser-probe.log).

Actual tests: **1 lần gọi navigate, 0 thao tác UI hoàn tất, 0 ảnh**. Không sửa app/DOCX, đọc secrets, ghi DB hay chạy browser qua shell. Chưa có bằng chứng để kết luận lỗi UX sản phẩm.