import { Emoji } from 'animated-fluent-emojis/react'

import 'animated-fluent-emojis/style.css'

/**
 * The hero's live waving hand, a React island hydrated when the browser is
 * idle. It plays on hover and rests on its poster frame under reduced motion.
 * @param props - Component props.
 * @param props.label - Accessible description of the emoji.
 * @returns A waving hand that plays on hover.
 */
export default function HeroEmoji(props: { label: string }) {
  return (
    <Emoji
      id="1f44b_wavinghand"
      size={144}
      playOnHover
      autoPlay={false}
      alt={props.label}
    />
  )
}
