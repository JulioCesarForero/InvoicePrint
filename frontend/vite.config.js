// https://vite.dev/config/
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc'

export default ({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd()))
  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': "/src",
        src: "/src",
        components: "/src/components",
        assets: "/src/assets",
        hooks: "/src/hooks",
        contexts: "/src/contexts",
        i18n: "/src/i18n",
        pages: "/src/pages",
        layouts: "/src/layouts",
      },
    },
    server: {
      open: true,
      port: parseInt(process.env.VITE_PORT)
    }
  });
}