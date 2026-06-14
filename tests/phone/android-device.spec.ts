import { test, expect } from '@playwright/test'
import { execFileSync } from 'node:child_process'

function run(command: string, args: string[]): string {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()
}

test('connected Android phone is visible and authorized through ADB', async () => {
  const version = run('adb', ['version'])
  expect(version).toContain('Android Debug Bridge')

  const devicesOutput = run('adb', ['devices'])
  const deviceLines = devicesOutput
    .split('\n')
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)

  expect(deviceLines.length, `ADB devices output:\n${devicesOutput}`).toBeGreaterThan(0)

  const authorizedDevice = deviceLines.find((line) => /\tdevice$/.test(line))

  expect(
    authorizedDevice,
    `No authorized Android device found.\n\nADB output:\n${devicesOutput}\n\nUnlock the phone, enable USB debugging, and approve the computer.`
  ).toBeTruthy()

  const serial = authorizedDevice!.split(/\s+/)[0]

  const model = run('adb', ['-s', serial, 'shell', 'getprop', 'ro.product.model'])
  const manufacturer = run('adb', ['-s', serial, 'shell', 'getprop', 'ro.product.manufacturer'])
  const androidVersion = run('adb', ['-s', serial, 'shell', 'getprop', 'ro.build.version.release'])

  expect(model).not.toEqual('')
  expect(manufacturer).not.toEqual('')
  expect(androidVersion).not.toEqual('')

  console.log({
    serial,
    manufacturer,
    model,
    androidVersion,
  })
})
