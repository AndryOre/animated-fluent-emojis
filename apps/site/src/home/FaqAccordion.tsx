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
    <Accordion multiple hiddenUntilFound className="max-w-3xl">
      {items.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          className="border-b border-border first:border-t"
        >
          <AccordionTrigger className="py-4 text-base font-bold">
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
