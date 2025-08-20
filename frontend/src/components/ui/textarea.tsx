import * as React from 'react'
import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-[80px] w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground',
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
