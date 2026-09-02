"use client"

import { useToast } from "@/hooks/use-toast"
import * as React from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, name, dismissesOn, actions, icon, ...props }) {
        return (
          <ToastItem key={id} id={id} dismissesOn={dismissesOn} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </ToastItem>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

function ToastItem({ id, dismissesOn, children, ...props }: React.ComponentProps<typeof Toast> & { id: string; dismissesOn?: number | null }) {
  const { dismiss } = useToast()
  React.useEffect(() => {
    if (dismissesOn == null || dismissesOn <= 0) return
    const timer = window.setTimeout(() => dismiss(id), dismissesOn * 1000)
    return () => window.clearTimeout(timer)
  }, [dismiss, dismissesOn, id])
  return <Toast {...props}>{children}</Toast>
}
