import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5678, // Tùy chỉnh port
    open: true, // Tự động mở trình duyệt
    hmr: false, // Bật hot module replacement
  },
  optimizeDeps: {
    include: ["react", "react-dom", "@mantine/core", "@mantine/hooks"], // Thêm thư viện sử dụng thường xuyên
    // exclude: ["large-unused-library"], // Loại bỏ các thư viện không cần thiết
  },
  build: {
    sourcemap: true,
    chunkSizeWarningLimit: 1000, // Tăng giới hạn cảnh báo chunk size
  },
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
});
