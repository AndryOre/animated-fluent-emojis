import { expect, test } from 'vitest'

import { buttonVariants } from './button'

test('buttonVariants defaults to the primary variant with the rounded shape', () => {
  const classes = buttonVariants()

  expect(classes).toContain('bg-primary')
  expect(classes).toContain('rounded-lg')
})

test('buttonVariants applies the brand pill shape', () => {
  const classes = buttonVariants({ shape: 'pill' })

  expect(classes).toContain('rounded-full')
  expect(classes).not.toContain('rounded-lg')
})

test('buttonVariants lets className override variant utilities', () => {
  const classes = buttonVariants({ size: 'lg', className: 'h-11 px-6' })

  expect(classes).toContain('h-11')
  expect(classes).not.toContain('h-9')
})
