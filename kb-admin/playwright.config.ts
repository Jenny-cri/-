import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  // 并行执行 + 失败重试
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  // 报告：HTML 报告 + 终端列表输出
  reporter: [['html', { open: 'never' }], ['list']],
  // 失败时自动截图
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  // 测试前自动启动 dev server（若已在运行则复用）
  webServer: {
    command: 'npm run dev -- --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
