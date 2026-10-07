import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

export interface FaqEntry {
  question: string
  answer: string
}

/**
 * Landing FAQ: every item can be open at once and every answer is present in
 * the server-rendered HTML.
 * @param props - Component props.
 * @param props.items - Question and answer pairs, already localized.
 * @returns The expandable list of questions.
 */
export default function FaqAccordion({ items }: { items: FaqEntry[] }) {
  return (
    <Accordion multiple hiddenUntilFound className="max-w-3xl gap-3">
      {items.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="rounded-brand border border-border bg-card px-4 py-1"
        >
          <AccordionTrigger className="text-base font-bold">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            <p>{item.answer}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
