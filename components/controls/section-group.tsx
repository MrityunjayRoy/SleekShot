import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Section({
  value,
  title,
  children,
  className,
}: {
  value: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AccordionItem value={value} className="border-b-0">
      <AccordionTrigger className="px-1 py-2.5 text-sm font-semibold">{title}</AccordionTrigger>
      <AccordionContent className="pb-1">
        <div className={`grid gap-3 px-1 pb-2 ${className ?? ""}`}>{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}