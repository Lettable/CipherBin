"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Copy, Github, Info, Lock, Unlock, Clock, Code, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Textarea } from "@/components/ui/textarea"
import AboutDialog from "@/components/AboutDialog"
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration"
import gun from "@/lib/gun"
import crypto from 'crypto';

const generateUUID = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

class Paste {
  
  /**
   * Create a new Paste.
   *
   * @param {string} content - The raw content of the paste.
   * @param {string} expiresAt - Expiration timestamp in ISO format.
   * @param {boolean} isPublic - If true, no encryption is done.
   * @param {string|null} password - Required if isPublic is false.
   * @param {string} syntax - Language or syntax (e.g., "javascript", "python").
  */
 
  constructor(content, expiresAt, isPublic, password, syntax) {
    this.createdAt = new Date().toISOString();
    this.expiresAt = expiresAt;
    this.isPublic = isPublic;
    this.syntax = syntax;

    if (!isPublic && !password) {
      throw new Error("Password is required for private pastes.");
    }

    if (isPublic) {
      this.content = Buffer.from(content, 'utf8').toString('base64');
      this._hmacKey = Buffer.from("public-secret", 'utf8');
    } else {
      this.content = this.encryptContent(content, password);
      this._hmacKey = crypto.createHash('sha256').update(password).digest();
    }

    this.pasteObject = {
      content: this.content,
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      isPublic: this.isPublic,
      syntax: this.syntax
    };

    this.signature = this.computeSignature(this.pasteObject, this._hmacKey);
    this.pasteObject.signature = this.signature;
  }

  encryptContent(plainText, password) {
    const key = crypto.createHash('sha256').update(password).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(plainText, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return Buffer.concat([iv, encrypted]).toString('base64');
  }

  computeSignature(object, key) {
    const jsonStr = JSON.stringify(object);
    const hmac = crypto.createHmac('sha256', key);
    hmac.update(jsonStr);
    return hmac.digest('base64');
  }

  getObject() {
    return this.pasteObject;
  }

  decryptContent(password) {
    if (this.isPublic) {
      return Buffer.from(this.content, 'base64').toString('utf8');
    } else {
      if (!password) {
        throw new Error("Password is required to decrypt this paste.");
      }
      const key = crypto.createHash('sha256').update(password).digest();
      const encryptedData = Buffer.from(this.content, 'base64');
      const iv = encryptedData.slice(0, 16);
      const ciphertext = encryptedData.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    }
  }

  static encodeObject(pasteObj) {
    return Buffer.from(JSON.stringify(pasteObj), 'utf8').toString('base64');
  }

  static decodeObject(encodedStr) {
    return JSON.parse(Buffer.from(encodedStr, 'base64').toString('utf8'));
  }

  static decryptPaste(pasteObj, password) {
    if (pasteObj.isPublic) {
      return Buffer.from(pasteObj.content, 'base64').toString('utf8');
    } else {
      const key = crypto.createHash('sha256').update(password).digest();
      const encryptedData = Buffer.from(pasteObj.content, 'base64');
      const iv = encryptedData.slice(0, 16);
      const ciphertext = encryptedData.slice(16);
      const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    }
  }
}


export default function PastePage() {
  const [content, setContent] = useState("")
  const [showDialog, setShowDialog] = useState(false)
  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState("")
  const [expiresAt, setExpiresAt] = useState("")
  const [syntax, setSyntax] = useState("plaintext")
  const [pasteUrl, setPasteUrl] = useState("")
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
      const uuid = pathname.slice(1);
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

  const handleSaveLongPaste = () => {
    const expiration = expiresAt ? new Date(expiresAt).toISOString() : "9999-12-31T23:59:59Z"
    try {
      const newPaste = new Paste(content, expiration, isPublic, isPublic ? null : password, syntax)
      const encoded = Paste.encodeObject(newPaste.getObject())
      const url = `${window.location.origin}/sg/${encoded}`
      setPasteUrl(url)
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

  const handleSavePaste = async () => {
    const expiration = expiresAt ? new Date(expiresAt).toISOString() : "9999-12-31T23:59:59Z";
    try {
      const newPaste = new Paste(content, expiration, isPublic, isPublic ? null : password, syntax);
      const encoded = Paste.encodeObject(newPaste.getObject());
      const uuid = generateUUID();
      gun.get('pastes').get(uuid).put({ encoded }, (ack) => {
        if (ack.err) {
          toast({
            title: "Error",
            description: ack.err,
            variant: "destructive",
          });
        }
      });
      const url = `${window.location.origin}/sc/${uuid}`;
      setPasteUrl(url);
      setShowDialog(false);
      setShowUrlDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
                  This will generate a longer URL that contains the entire paste content, allowing offline access. Make
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
            <Button onClick={isLongUrl ? handleSaveLongPaste : handleSavePaste} className="flex items-center gap-2">
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
              <Label className="text-sm text-neutral-400">
                {isLongUrl ? "Long URL (contains full paste content)" : "Short URL"}
              </Label>
              <div className="flex gap-2">
                <Input value={pasteUrl} readOnly className="bg-black border-0" />
                <Button size="icon" onClick={() => copyToClipboard(pasteUrl)}>
                  <Copy className="w-5 h-5" />
                </Button>
              </div>
              {isLongUrl && (
                <p className="text-sm text-neutral-400">
                  ⚠️ This URL contains your entire paste content. Store it securely for offline access.
                </p>
              )}
            </div>
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

