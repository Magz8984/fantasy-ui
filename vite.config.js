import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// import tailwindcss from 'tailwindcss'
// import autoprefixer from 'autoprefixer'

import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // css: {
  //   postcss: {
  //     plugins: [tailwindcss, autoprefixer],
  //   },
  // },
});
