"use client"

import { useEffect, useRef } from "react"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-javascript"
import "prismjs/components/prism-python"
import "prismjs/components/prism-css"
import "prismjs/components/prism-markup"

const CodeEditor = ({ value, onChange, language }) => {
  const textareaRef = useRef(null)
  const preRef = useRef(null)

  useEffect(() => {
    Prism.highlightElement(preRef.current)
  }, [value])

  const handleKeyDown = (evt) => {
    let value = evt.target.value
    const selStartPos = evt.target.selectionStart

    if (evt.key === "Tab") {
      evt.preventDefault()

      value = value.substring(0, selStartPos) + "    " + value.substring(selStartPos, value.length)
      evt.target.value = value
      evt.target.selectionStart = evt.target.selectionEnd = selStartPos + 4
      onChange(value)
    }
  }

  return (
    <div className="relative w-full h-full overflow-hidden font-mono text-sm text-white">
      <pre
        ref={preRef}
        className="absolute top-0 left-0 w-full h-full m-0 p-4 overflow-hidden bg-black text-white"
        style={{ pointerEvents: "none" }}
      >
        <code className={`language-${language}`}>{value}</code>
      </pre>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className="absolute top-0 left-0 w-full h-full m-0 p-4 overflow-auto bg-transparent text-transparent caret-white resize-none outline-none"
        spellCheck="false"
      />
    </div>
  )
}

export default CodeEditor

