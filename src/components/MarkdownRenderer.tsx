import Markdown from "react-markdown"
import { ComponentProps } from "react"
import { cn } from "@/lib/utils"

export function MarkdownRenderer({ className, ...props }: { className?: string } & ComponentProps<typeof Markdown>) {
  return (
    <div className={cn("max-w-none prose prose-neutral dark:prose-invert font-sans", className)}>
      <Markdown {...props} />
    </div>
  )
}