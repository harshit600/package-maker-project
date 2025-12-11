// vite.config.js
import { defineConfig } from "file:///E:/Pictures/codegpt/node_modules/vite/dist/node/index.js";
import react from "file:///E:/Pictures/codegpt/node_modules/@vitejs/plugin-react-swc/index.mjs";

// config.jsx
var config = {
  API_HOST: "https://pluto-hotel-server-15c83810c41c.herokuapp.com"
};
var config_default = config;

// vite.config.js
import svgr from "file:///E:/Pictures/codegpt/node_modules/vite-plugin-svgr/dist/index.js";
var vite_config_default = defineConfig({
  server: {
    proxy: {
      "/api": {
        target: config_default.API_HOST,
        secure: false
      }
    }
  },
  plugins: [react(), svgr()],
  optimizeDeps: {
    exclude: ["react-script-tag"]
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    }
  },
  base: "./"
  // This ensures assets are loaded with relative paths
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAiY29uZmlnLmpzeCJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkU6XFxcXFBpY3R1cmVzXFxcXGNvZGVncHRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXFBpY3R1cmVzXFxcXGNvZGVncHRcXFxcdml0ZS5jb25maWcuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0U6L1BpY3R1cmVzL2NvZGVncHQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0LXN3YydcbmltcG9ydCBjb25maWcgZnJvbSAnLi9jb25maWcnXG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHNlcnZlcjoge1xuICAgIHByb3h5OiB7XG4gICAgICAnL2FwaSc6IHtcbiAgICAgICAgdGFyZ2V0OiBjb25maWcuQVBJX0hPU1QsXG4gICAgICAgIHNlY3VyZTogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gIH0sXG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBzdmdyKCldLFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ3JlYWN0LXNjcmlwdC10YWcnXSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICBvdXREaXI6ICdkaXN0JyxcbiAgICBhc3NldHNEaXI6ICdhc3NldHMnLFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIG91dHB1dDoge1xuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgYmFzZTogJy4vJywgLy8gVGhpcyBlbnN1cmVzIGFzc2V0cyBhcmUgbG9hZGVkIHdpdGggcmVsYXRpdmUgcGF0aHNcbn0pIiwgImNvbnN0IGNvbmZpZyA9IHtcblx0QVBJX0hPU1Q6IFwiaHR0cHM6Ly9wbHV0by1ob3RlbC1zZXJ2ZXItMTVjODM4MTBjNDFjLmhlcm9rdWFwcC5jb21cIixcbn1cblxuZXhwb3J0IGRlZmF1bHQgY29uZmlnO1xuXG5cbi8vIGh0dHA6Ly8xMjcuMC4wLjE6NTE3M1xuXG4vLyBodHRwczovL2ZhdGhvbWxlc3MtY2FzdGxlLTEzNTU0LWE2NjRmN2U3ZGFhYy5oZXJva3VhcHAuY29tIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpUCxTQUFTLG9CQUFvQjtBQUM5USxPQUFPLFdBQVc7OztBQ0RsQixJQUFNLFNBQVM7QUFBQSxFQUNkLFVBQVU7QUFDWDtBQUVBLElBQU8saUJBQVE7OztBRERmLE9BQU8sVUFBVTtBQUdqQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixPQUFPO0FBQUEsTUFDTCxRQUFRO0FBQUEsUUFDTixRQUFRLGVBQU87QUFBQSxRQUNmLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQUEsRUFDekIsY0FBYztBQUFBLElBQ1osU0FBUyxDQUFDLGtCQUFrQjtBQUFBLEVBQzlCO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUEsTUFDaEI7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsTUFBTTtBQUFBO0FBQ1IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
