import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionItemProps {
  question: string
  children: ReactNode
  defaultOpen?: boolean
}

export function AccordionItem({ question, children, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left bg-white hover:bg-light-olive/50 transition-colors cursor-pointer"
      >
        <span className="font-medium text-gray-900 pr-4">{question}</span>
        <ChevronDown
          size={20}
          className={`text-gold flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-5 pt-1 bg-white text-gray-600 leading-relaxed text-sm border-t border-gray-50">
          {children}
        </div>
      )}
    </div>
  )
}

interface AccordionProps {
  items: { id: string; question: string; answer: string }[]
}

export function Accordion({ items }: AccordionProps) {
  return (
    <div className="flex flex-col gap-3">
      {items.map(item => (
        <AccordionItem key={item.id} question={item.question}>
          <p>{item.answer}</p>
        </AccordionItem>
      ))}
    </div>
  )
}
