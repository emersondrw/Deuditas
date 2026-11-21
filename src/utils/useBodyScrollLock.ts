/**
 * @description       : Reference-counted body scroll lock so stacked modals do not unlock the page prematurely.
 * @group             : Utilities
 * @author            : Emerson VI
 * @last modified on  : 2026-11-21
 * @last modified by  : Emerson VI
 **/

import { useEffect } from "react"

let lockCount = 0

function applyLock() {
  document.body.style.overflow = lockCount > 0 ? "hidden" : ""
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    lockCount += 1
    applyLock()
    return () => {
      lockCount = Math.max(0, lockCount - 1)
      applyLock()
    }
  }, [active])
}
