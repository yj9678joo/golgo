import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { forwardRef, type ComponentPropsWithoutRef, type ComponentRef } from 'react'
import { cn } from '@/lib/utils'

export const Sheet = SheetPrimitive.Root
export const SheetTrigger = SheetPrimitive.Trigger
export const SheetClose = SheetPrimitive.Close

export const SheetPortal = SheetPrimitive.Portal

export const SheetOverlay = forwardRef<
  ComponentRef<typeof SheetPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/35', className)}
    {...props}
  />
))
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

type SheetContentProps = ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
  showClose?: boolean
}

export const SheetContent = forwardRef<
  ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ className, children, showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        'fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 rounded-t-[22px] bg-white p-5 shadow-xl outline-none',
        className,
      )}
      {...props}
    >
      {children}
      {showClose ? (
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
          <X className="size-4" aria-hidden="true" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      ) : null}
    </SheetPrimitive.Content>
  </SheetPortal>
))
SheetContent.displayName = SheetPrimitive.Content.displayName

export const SheetHeader = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-col space-y-2 text-left', className)} {...props} />
)
SheetHeader.displayName = 'SheetHeader'

export const SheetFooter = ({ className, ...props }: ComponentPropsWithoutRef<'div'>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
)
SheetFooter.displayName = 'SheetFooter'

export const SheetTitle = forwardRef<
  ComponentRef<typeof SheetPrimitive.Title>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

export const SheetDescription = forwardRef<
  ComponentRef<typeof SheetPrimitive.Description>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName
