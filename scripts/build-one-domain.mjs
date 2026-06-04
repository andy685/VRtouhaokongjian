import { spawnSync } from 'node:child_process'
import { cp, mkdir, rm } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const adminDir = resolve(repoRoot, 'admin-dashboard')
const cashierDir = resolve(repoRoot, 'cashier-ui')
const cashierDist = resolve(cashierDir, 'dist')
const combinedCashierDist = resolve(adminDir, 'dist', 'cashier')

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}`)
  }
}

run('npx', ['vite', 'build'], adminDir)
run('npm', ['run', 'build'], cashierDir)

await rm(combinedCashierDist, { recursive: true, force: true })
await mkdir(combinedCashierDist, { recursive: true })
await cp(cashierDist, combinedCashierDist, { recursive: true })
