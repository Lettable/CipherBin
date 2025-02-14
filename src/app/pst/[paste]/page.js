"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Lock, Unlock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import AboutDialog from "@/components/AboutDialog"
import gun from "@/lib/gun"
import Paste from "@/lib/Paste"

export default function PastePage() {
  const [content, setContent] = useState("")
  const [syntax, setSyntax] = useState("plaintext")
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState("")
  const [decryptPassword, setDecryptPassword] = useState("")
  const [showDecryptDialog, setShowDecryptDialog] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    async function decodePaste() {
      let uuid = pathname.slice(1);
      const prefix = "pst/";
      if (uuid.startsWith(prefix)) {
        uuid = uuid.slice(prefix.length);
      }
      if (!uuid) return;
      if (uuid) {
        gun.get('pastes').get(uuid).on((data) => {
          if (!data || !data.encoded) {
            setError("Paste not found.");
            return;
          }
          try {
            const obj = Paste.decodeObject(data.encoded);
            if (new Date(obj.expiresAt) < new Date()) {
              setError("This paste has expired.");
              return;
            }
            if (obj.isPublic) {
              const content = Buffer.from(obj.content, "base64").toString("utf8");
              setContent(content);
              setDecryptedContent(content);
              setSyntax(obj.syntax);
            } else {
              setShowDecryptDialog(true);
            }
          } catch (e) {
            setError("Invalid paste data.");
          }
        });
      }
    }
    decodePaste();
  }, [pathname]);


  const handleDecrypt = () => {
    const uuid = pathname.slice(1);
    gun.get('pastes').get(uuid).once((data) => {
      if (!data || !data.encoded) {
        toast({
          title: "Error",
          description: "Paste not found.",
          variant: "destructive",
        });
        return;
      }
      try {
        const obj = Paste.decodeObject(data.encoded);
        const content = Paste.decryptPaste(obj, decryptPassword);
        setContent(content);
        setDecryptedContent(content);
        setSyntax(obj.syntax);
        setShowDecryptDialog(false);
      } catch (e) {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <main className="flex-grow">
        {error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="w-full min-h-[95vh] p-3 bg-black text-white border-0 resize-none focus:outline-none"
            style={{ fontSize: '20px', lineHeight: '20px' }}
          />
        )}
      </main>

      <footer className="bg-[#333333] p-0 flex justify-between items-center">
        {/* Left Group: GitHub and About */}
        <div className="flex items-center rounded-none">
          <div className="flex items-center gap-2 space-x-4">
            <span className="ml-2 text-xl text-neutral-400">Length: {content.length}</span>
            <span className="text-xl text-neutral-400 mr-2">Lines: {content.split("\n").length}</span>
          </div>
          <Button
            variant="ghost"
            className="text-neutral-400 hover:bg-[#666767] hover:text-white transition-colors ml-2 duration-0 rounded-none"
            asChild
          >
            <a
              href="https://github.com/Lettable/CipherBin"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              <span className="text-xl">[GitHub]</span>
            </a>
          </Button>
          <Button
            variant="ghost"
            className="text-neutral-400 hover:bg-[#666767] hover:text-white transition-colors duration-0 rounded-none"
            onClick={() => setShowAboutDialog(true)}
          >
            <div className="flex items-center gap-1">
              <span className="text-xl">[About]</span>
            </div>
          </Button>
        </div>

        {/* Right Group: Syntax Selector and Save Paste */}
        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            className="text-neutral-400 hover:bg-[#666767] hover:text-white transition-colors duration-0 rounded-none"
            onClick={() => router.push("/")}
          >
            <div className="flex items-center gap-1">
              <span className="text-xl">[New Paste]</span>
            </div>
          </Button>
        </div>
      </footer>

      <Dialog open={showDecryptDialog} onOpenChange={setShowDecryptDialog}>
        <DialogContent className="bg-[#333333] text-white border-0">
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="decrypt-password" className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Password
            </Label>
            <Input
              id="decrypt-password"
              type="password"
              value={decryptPassword}
              onChange={(e) => setDecryptPassword(e.target.value)}
              className="bg-black border-0"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleDecrypt} className="flex items-center gap-2">
              <Unlock className="w-5 h-5" />
              Decrypt Paste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AboutDialog open={showAboutDialog} onOpenChange={setShowAboutDialog} />
    </div>
  )
}

