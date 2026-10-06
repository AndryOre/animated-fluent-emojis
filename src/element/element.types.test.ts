import type { JSX as PreactJsx } from 'preact'
import type { JSX as SolidJsx } from 'solid-js'
import { expectTypeOf, test } from 'vitest'
import type { DefineComponent, GlobalComponents } from 'vue'

import type { FluentEmojiAttributes, FluentEmojiElement } from './index.js'

test('the tag name map resolves the element type', () => {
  expectTypeOf<
    HTMLElementTagNameMap['fluent-emoji']
  >().toEqualTypeOf<FluentEmojiElement>()
  expectTypeOf<FluentEmojiElement['playOnHover']>().toEqualTypeOf<
    boolean | undefined
  >()
})

test('Vue global components accept the attributes', () => {
  type VueProps = InstanceType<GlobalComponents['fluent-emoji']>['$props']
  expectTypeOf<VueProps>().toEqualTypeOf<FluentEmojiAttributes>()
  expectTypeOf<DefineComponent>().not.toBeNever()
})

test('Solid and Preact JSX accept the attributes', () => {
  expectTypeOf<
    SolidJsx.IntrinsicElements['fluent-emoji']
  >().toEqualTypeOf<FluentEmojiAttributes>()
  expectTypeOf<
    PreactJsx.IntrinsicElements['fluent-emoji']
  >().toEqualTypeOf<FluentEmojiAttributes>()
  expectTypeOf<{
    id: 'cat'
    size: 24
    'play-on-hover': true
  }>().toExtend<FluentEmojiAttributes>()
  expectTypeOf<{ size: boolean }>().not.toExtend<FluentEmojiAttributes>()
})
