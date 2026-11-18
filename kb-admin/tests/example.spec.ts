import { expect, test } from '@playwright/test'

test.describe('知识库管理平台 - 冒烟测试', () => {
  test('登录页加载：标题与主按钮可见', async ({ page }) => {
    await page.goto('/')

    // 1. 断言页面标题
    await expect(page).toHaveTitle('知识库管理平台')

    // 2. 断言页面主标题文案可见
    await expect(page.getByRole('heading', { name: '知识库管理平台' })).toBeVisible()

    // 3. 断言登录卡片与主按钮可见
    await expect(page.getByText('管理员登录')).toBeVisible()
    const loginButton = page.getByRole('button', { name: '登录后台' })
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
  })

  test('登录后进入仪表盘', async ({ page }) => {
    await page.goto('/')

    // 填写任意账号密码登录
    await page.getByLabel('邮箱').fill('admin@company.com')
    await page.getByLabel('密码').fill('demo1234')
    await page.getByRole('button', { name: '登录后台' }).click()

    // 登录成功后应进入仪表盘
    await expect(page.getByRole('heading', { name: '仪表盘', exact: true })).toBeVisible()
    await expect(page.getByText('知识库总数')).toBeVisible()
  })
})
