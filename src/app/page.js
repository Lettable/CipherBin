"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Lock, Unlock, Clock, Code, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import AboutDialog from "@/components/AboutDialog"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"
import gun from "@/lib/gun"
import crypto from "crypto"
import Paste from "@/lib/Paste"

const generateUUID = () => {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
}

export default function PastePage() {
  const [content, setContent] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [syntax, setSyntax] = useState("plaintext")
  const [shortUrl, setShortUrl] = useState("")
  const [longUrl, setLongUrl] = useState("")
  const [showUrlDialog, setShowUrlDialog] = useState(false)
  const [showAboutDialog, setShowAboutDialog] = useState(false)
  const [decryptedContent, setDecryptedContent] = useState("")
  const [decryptPassword, setDecryptPassword] = useState("")
  const [showDecryptDialog, setShowDecryptDialog] = useState(false)
  const [isLongUrl, setIsLongUrl] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  useEffect(() => {
    async function decodePaste() {
      const uuid = pathname.slice(1)
      if (uuid) {
        gun
          .get("pastes")
          .get(uuid)
          .on((data) => {
            if (!data || !data.encoded) {
              setError("Paste not found.")
              return
            }
            try {
              const obj = Paste.decodeObject(data.encoded)
              if (new Date(obj.expiresAt) < new Date()) {
                setError("This paste has expired.")
                return
              }
              if (obj.isPublic) {
                const content = Buffer.from(obj.content, "base64").toString("utf8")
                setContent(content)
                setDecryptedContent(content)
                setSyntax(obj.syntax)
              } else {
                setShowDecryptDialog(true)
              }
            } catch (e) {
              setError("Invalid paste data.")
            }
          })
      }
    }
    decodePaste()
  }, [pathname])

  const handleCreatePaste = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Paste content cannot be empty",
        variant: "destructive",
      })
      return
    }
    setShowDialog(true)
  }

  const handleSavePaste = async () => {
    const expiration = expiresAt ? new Date(expiresAt).toISOString() : "9999-12-31T23:59:59Z"
    try {
      const newPaste = new Paste(content, expiration, isPublic, isPublic ? null : password, syntax)
      const encoded = Paste.encodeObject(newPaste.getObject())
      const uuid = generateUUID()
      gun
        .get("pastes")
        .get(uuid)
        .put({ encoded }, (ack) => {
          if (ack.err) {
            toast({
              title: "Error",
              description: ack.err,
              variant: "destructive",
            })
          }
        })
      const shortUrl = `${window.location.origin}/pst/${uuid}`
      setShortUrl(shortUrl)

      if (isLongUrl) {
        const longUrl = `${encoded}`
        setLongUrl(longUrl)
      } else {
        setLongUrl("")
      }

      setShowDialog(false)
      setShowUrlDialog(true)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDecrypt = () => {
    const uuid = pathname.slice(1)
    gun
      .get("pastes")
      .get(uuid)
      .once((data) => {
        if (!data || !data.encoded) {
          toast({
            title: "Error",
            description: "Paste not found.",
            variant: "destructive",
          })
          return
        }
        try {
          const obj = Paste.decodeObject(data.encoded)
          const content = Paste.decryptPaste(obj, decryptPassword)
          setContent(content)
          setDecryptedContent(content)
          setSyntax(obj.syntax)
          setShowDecryptDialog(false)
        } catch (e) {
          toast({
            title: "Error",
            description: "Incorrect password",
            variant: "destructive",
          })
        }
      })
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "URL copied to clipboard",
    })
  }

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
            style={{ fontSize: "20px", lineHeight: "20px" }}
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
            className="text-neutral-400 hover:bg-[#666767] hover:text-white ml-2 transition-colors duration-0 rounded-none"
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
            onClick={handleCreatePaste}
          >
            <div className="flex items-center gap-1">
              <span className="text-xl">[Save Paste]</span>
            </div>
          </Button>
        </div>
      </footer>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-[#333333] text-white border-0">
          <DialogHeader>
            <DialogTitle>Create New Paste</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="public" className="flex items-center gap-2">
                {isPublic ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isPublic ? "Public Paste" : "Private Paste"}
              </Label>
              <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
            {!isPublic && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-black border-neutral-800"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="expires" className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Expires At (Optional)
              </Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="bg-black border-neutral-800"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="syntax" className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Syntax
              </Label>
              <Select value={syntax} onValueChange={setSyntax}>
                <SelectTrigger className="bg-black border-neutral-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#333333] text-white border-neutral-800">
                  <SelectItem value="plaintext">Plain Text</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                  <SelectItem value="css">CSS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-2 border-t border-neutral-700">
              <div className="flex items-center justify-between">
                <Label htmlFor="offline" className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Create Long URL for Offline Access
                </Label>
                <Switch id="offline" checked={isLongUrl} onCheckedChange={setIsLongUrl} />
              </div>
              {isLongUrl && (
                <p className="text-sm text-neutral-400">
                  This will generate a longer encoded string that contains the entire paste content, allowing offline access. Make
                  sure to save this URL securely as it will be significantly longer.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="flex text-black items-center gap-2"
            >
              <X className="w-5 h-5" />
              Cancel
            </Button>
            <Button onClick={handleSavePaste} className="flex items-center gap-2">
              <Save className="w-5 h-5" />
              Save Paste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="bg-[#333333] text-white border-0">
          <DialogHeader>
            <DialogTitle>Paste Created Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-neutral-400">Short URL</Label>
              <div className="flex gap-2">
                <Input value={shortUrl} readOnly className="bg-black border-0" />
                <Button size="icon" onClick={() => copyToClipboard(shortUrl)}>
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
            </div>
            {isLongUrl && (
              <div className="space-y-2">
                <Label className="text-sm text-neutral-400">Encoded String (contains full paste content)</Label>
                <div className="flex gap-2">
                  <Input value={longUrl} readOnly className="bg-black border-0" />
                  <Button size="icon" onClick={() => copyToClipboard(longUrl)}>
                    <Copy className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-sm text-neutral-400">
                  ⚠️ This String contains your entire paste content. Store it securely for offline access.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

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
      <ServiceWorkerRegistration />
    </div>
  )
}

