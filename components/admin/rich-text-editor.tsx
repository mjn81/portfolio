"use client"

import { useState, useRef, useCallback, KeyboardEvent, RefObject } from "react"
import {
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  ImageIcon,
  Heading2,
  Code,
  Eye,
  EyeOff,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Maximize,
  Minimize,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { ImageGalleryPicker } from "@/components/admin/image-gallery-picker"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  className,
  placeholder = "Write your content here...",
}: RichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write")
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [galleryPickerOpen, setGalleryPickerOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const textareaRefNormal = useRef<HTMLTextAreaElement>(null)
  const textareaRefModal = useRef<HTMLTextAreaElement>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const getActiveTextareaRef = (): RefObject<HTMLTextAreaElement | null> => {
    return isFullScreen ? textareaRefModal : textareaRefNormal;
  }

  const getSelectedText = () => {
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return ""
    const start = activeRef.current.selectionStart
    const end = activeRef.current.selectionEnd
    return value.substring(start, end)
  }

  const insertText = (before: string, after = "") => {
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return

    const start = activeRef.current.selectionStart
    const end = activeRef.current.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      const refToFocus = getActiveTextareaRef(); // Re-check which ref is active
      if (!refToFocus.current) return
      const newCursorPos = start + before.length + selectedText.length + after.length
      refToFocus.current.focus()
      refToFocus.current.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleBold = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("**", "**")
    } else {
      insertText("**Bold text**")
    }
  }

  const handleItalic = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("*", "*")
    } else {
      insertText("*Italic text*")
    }
  }

  const handleHeading = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("## ", "")
    } else {
      insertText("## Heading")
    }
  }

  const handleList = () => {
    insertText("\n- List item 1\n- List item 2\n- List item 3\n")
  }

  const handleOrderedList = () => {
    insertText("\n1. List item 1\n2. List item 2\n3. List item 3\n")
  }

  const handleCode = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("`", "`")
    } else {
      insertText("`code`")
    }
  }

  const handleLink = () => {
    const selectedText = getSelectedText()
    setLinkText(selectedText)
    setLinkDialogOpen(true)
  }

  const insertLink = () => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`
      insertText(linkMarkdown)
      setLinkDialogOpen(false)
      setLinkUrl("")
      setLinkText("")
    }
  }

  const handleImage = () => {
    setImageDialogOpen(true)
  }

  const insertImage = () => {
    if (imageUrl) {
      const imageMarkdown = `![${imageAlt}](${imageUrl})`
      insertText(imageMarkdown)
      setImageDialogOpen(false)
      setImageUrl("")
      setImageAlt("")
    }
  }

  const handleGalleryImage = () => {
    setGalleryPickerOpen(true)
  }

  const insertGalleryImage = useCallback((url: string, alt: string) => {
    const imageMarkdown = `![${alt}](${url})`
    insertText(imageMarkdown)
  }, [])

  const handleAlignLeft = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: left;">\n\n${selectedText}\n\n</div>`)
    }
  }

  const handleAlignCenter = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: center;">\n\n${selectedText}\n\n</div>`)
    }
  }

  const handleAlignRight = () => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: right;">\n\n${selectedText}\n\n</div>`)
    }
  }

  const handleUndo = () => {
    const activeRef = getActiveTextareaRef();
    if (activeRef.current) {
      activeRef.current.focus()
      document.execCommand("undo")
    }
  }

  const handleRedo = () => {
    const activeRef = getActiveTextareaRef();
    if (activeRef.current) {
      activeRef.current.focus()
      document.execCommand("redo")
    }
  }

  const markdownToHtml = (markdown: string) => {
    let html = markdown
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/^\s*- (.*$)/gm, "<li>$1</li>")
      .replace(/^\s*\d+\. (.*$)/gm, "<li>$1</li>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n\n/g, "</p><p>")

    html = "<p>" + html + "</p>"

    html = html.replace(/<li>(.*?)<\/li>/g, (match) => {
      if (html.indexOf("<ul>") === -1) {
        return "<ul>" + match + "</ul>"
      }
      return match
    })

    return html
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    console.log("Key down:", event.key, "in", isFullScreen ? "modal" : "normal"); // Updated log

    if (event.key === 'Tab') {
      console.log("Tab key pressed. Preventing default and stopping propagation..."); // Updated log
      event.preventDefault(); // Prevent default focus change
      event.stopPropagation(); // Prevent event from bubbling up (e.g., to Dialog)

      // --- Restore value manipulation ---
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const tabCharacter = '\t';

      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + tabCharacter + currentValue.substring(end);
      onChange(newValue);

      // Use timeout for cursor positioning after state update
      setTimeout(() => {
         // Ensure the target still exists and is focused (might lose focus briefly on re-render)
         if (document.activeElement === target) {
             target.selectionStart = target.selectionEnd = start + tabCharacter.length;
         }
      }, 0);
      // --- End restored code ---

    } else if (event.key === 'Backspace') {
      console.log("Backspace key pressed.");
      // Still check if Backspace is causing issues
      // We could add stopPropagation here too if needed, but it's less common
      // event.stopPropagation();
    }
  };

  const EditorContent = ({isInModal = false, textareaRef}: {isInModal?: boolean, textareaRef: RefObject<HTMLTextAreaElement | null>}) => (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b px-2">
          <div className="flex flex-wrap items-center gap-1 p-1">
            <Button type="button" variant="ghost" size="icon" onClick={handleBold} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleItalic} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleHeading} title="Heading">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleLink} title="Link">
              <Link className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleImage} title="Image URL">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleGalleryImage} title="Image from Gallery">
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleList} title="Unordered List">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleOrderedList} title="Ordered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleCode} title="Code">
              <Code className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleAlignLeft} title="Align Left">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleAlignCenter} title="Align Center">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleAlignRight} title="Align Right">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleUndo} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={handleRedo} title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            {!isInModal && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsFullScreen(true)} title="Fullscreen">
                    <Maximize className="h-4 w-4" />
                </Button>
            )}
            {isInModal && (
                <DialogClose asChild>
                     <Button type="button" variant="ghost" size="icon" title="Exit Fullscreen">
                        <Minimize className="h-4 w-4" /> 
                    </Button>
                </DialogClose>
            )}
          </div>

          <TabsList>
            <TabsTrigger value="write" className="flex items-center gap-1">
              <EyeOff className="h-4 w-4" /> Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="p-0 mt-0">
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
                "resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                isInModal ? "min-h-[70vh] h-[75vh]" : "min-h-[300px]"
            )}
          />
        </TabsContent>

        <TabsContent value="preview" className={cn("p-4 prose prose-sm max-w-none mt-0", isInModal ? "min-h-[70vh] h-[75vh] overflow-y-auto" : "min-h-[300px]")}> 
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
        </TabsContent>
      </Tabs>
  )

  return (
    <div className={cn("border rounded-md", className)}>
      <EditorContent isInModal={false} textareaRef={textareaRefNormal} />

      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="link-text">Link Text</Label>
              <Input
                id="link-text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Text to display"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="link-url">URL</Label>
              <Input
                id="link-url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={insertLink}>Insert Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Insert Image</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image-url">Image URL</Label>
              <Input
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input
                id="image-alt"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setImageDialogOpen(false)}>Cancel</Button>
            <Button type="button" onClick={insertImage}>Insert Image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ImageGalleryPicker
        open={galleryPickerOpen}
        onOpenChange={setGalleryPickerOpen}
        onSelectImage={insertGalleryImage}
      />

      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
          <EditorContent isInModal={true} textareaRef={textareaRefModal} /> 
        </DialogContent>
      </Dialog>
    </div>
  )
}
