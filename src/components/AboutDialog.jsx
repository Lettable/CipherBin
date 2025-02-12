import { Dialog, DialogContent } from "@/components/ui/dialog"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "./ui/scroll-area"

const AboutDialog = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#333333] border-0 p-8 max-w-2xl h-[400px]">
        <ScrollArea>
        

        <h2 className="text-2xl font-bold text-white mb-6">What is CipherBin?</h2>

        <div className="space-y-4 text-neutral-200 leading-relaxed">
          <p>
            <span className="text-[#ff79c6]">CipherBin</span> is a secure pastebin designed for sharing code and text
            with complete privacy. With CipherBin, you can store any piece of content and instantly generate a shareable
            link – all without using a centralized database or any back-end server.
          </p>

          <p>
            However, what makes CipherBin special is that it works with{" "}
            <span className="text-[#ff79c6]">no database</span>, and{" "}
            <span className="text-[#ff79c6]">no back-end code</span>. Instead, the data is compressed and{" "}
            <span className="text-[#ff79c6]">stored entirely in the link</span> that you share, nowhere else!
          </p>

          <div className="mt-6 mb-4">
            <h3 className="text-white mb-4">Because of this design:</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <span className="text-xl">🔒</span>
                <span>
                  Your data remains private: Only someone with the correct password can decrypt private pastes
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🗑️</span>
                <span>
                  No centralized storage: There's no database or server storing your data – it lives only in the link
                  you share! {" "}<span className="text-[#ff79c6]"> Fuck Feds.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">👁️</span>
                <span>The server hosting CipherBin (or any clone of it) cannot read or access your data</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">⏳</span>
                <span>Your data will be accessible forever (as long as you have the link)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🔄</span>
                <span>You can access your data on every CipherBin clone, including your own installation</span>
              </li>
              <li className="flex gap-3">
                <span className="text-xl">🔍</span>
                <span>Google will not index your data, even if your link is public</span>
              </li>
            </ul>
          </div>

          <p>
            Currently, CipherBin is a closed source project. However, after gathering feedback and ironing out any bugs,
            we plan to open source it in the near future.
          </p>

          <p>
            If you want to know more, you can find more information on{" "}
            <a
              href="https://github.com/Lettable/CipherBin"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff79c6] hover:underline"
            >
              GitHub
            </a>
          </p>

          <p className="text-sm text-neutral-400 italic mt-6">
            Note: CipherBin is an enhanced and secure evolution of traditional pastebin services, built with modern
            cryptography and offline capabilities in mind.
          </p>
        </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

export default AboutDialog

