// Keyboard focus for the modal dialogs (sheets, the board, the name prompt, the new-day notice).
import { useEffect, useState, type RefObject } from 'react'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
/** Where each open dialog hands focus back: a dialog opened from inside another falls back to that one's opener. */
const returnTo = new WeakMap<Element, HTMLElement | null>()

/**
 * Moves focus into the dialog when it opens (unless something in it already took it), keeps Tab and Shift+Tab
 * cycling inside it, and on close gives focus back to whatever opened it, so keyboard and screen-reader users
 * never land on the page behind or back at the top.
 */
export function useDialogFocus(ref: RefObject<HTMLElement | null>) {
  // Read while rendering, before an autoFocus inside the dialog moves focus.
  const [opener] = useState(() => {
    const active = document.activeElement as HTMLElement | null
    const parent = active?.closest('[role="dialog"]')
    return { direct: active, fallback: parent ? (returnTo.get(parent) ?? null) : active }
  })
  useEffect(() => {
    const box = ref.current
    if (!box) return
    returnTo.set(box, opener.fallback)
    if (!box.contains(document.activeElement)) (box.querySelector<HTMLElement>(FOCUSABLE) ?? box).focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)]
      const first = items[0]
      const last = items[items.length - 1]
      if (!first) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    box.addEventListener('keydown', onKey)
    return () => {
      box.removeEventListener('keydown', onKey)
      // Not when another dialog has just taken focus (Settings opening How to play, the name prompt the board).
      const target = opener.direct && document.contains(opener.direct) ? opener.direct : opener.fallback
      if (target && document.contains(target) && !document.activeElement?.closest('[role="dialog"]')) target.focus()
    }
  }, [ref, opener])
}
