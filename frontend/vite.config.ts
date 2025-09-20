import { defineConfig } from 'vite';

// Use dynamic import for the react plugin to avoid CJS loading issues
export default async function() {
  const reactPlugin = (await import('@vitejs/plugin-react')).default;
  return defineConfig({
    plugins: [reactPlugin()],
    server: { port: 5173 }
  });
}
