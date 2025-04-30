"use client"

import { useState, useRef, useCallback, KeyboardEvent } from "react"
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [isFullScreen, setIsFullScreen] = useState(false)

  const getSelectedText = () => {
    if (!textareaRef.current) return ""
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    return value.substring(start, end)
  }

  const insertText = (before: string, after = "") => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)

    onChange(newText)

    // Set cursor position after insertion
    setTimeout(() => {
      if (!textareaRef.current) return
      const newCursorPos = start + before.length + selectedText.length + after.length
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
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
    if (textareaRef.current) {
      textareaRef.current.focus()
      document.execCommand("undo")
    }
  }

  const handleRedo = () => {
    if (textareaRef.current) {
      textareaRef.current.focus()
      document.execCommand("redo")
    }
  }

  // Simple Markdown to HTML conversion for preview
  const markdownToHtml = (markdown: string) => {
    let html = markdown
      // Convert headers
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      // Convert bold and italic
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      // Convert links
      .replace(/\[(.*?)\]$$(.*?)$$/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      // Convert images
      .replace(/!\[(.*?)\]$$(.*?)$$/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      // Convert lists
      .replace(/^\s*- (.*$)/gm, "<li>$1</li>")
      .replace(/^\s*\d+\. (.*$)/gm, "<li>$1</li>")
      // Convert code
      .replace(/`(.*?)`/g, "<code>$1</code>")
      // Convert paragraphs
      .replace(/\n\n/g, "</p><p>")

    // Wrap in paragraph tags
    html = "<p>" + html + "</p>"

    // Fix lists
    html = html.replace(/<li>(.*?)<\/li>/g, (match) => {
      if (html.indexOf("<ul>") === -1) {
        return "<ul>" + match + "</ul>"
      }
      return match
    })

    return html
  }

  // Handle Tab key press in textarea
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault(); // Prevent default focus change
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const tabCharacter = '\t'; // Or use spaces: '  ' or '    '

      // Insert tab character at cursor position
      target.value = target.value.substring(0, start) +
                     tabCharacter +
                     target.value.substring(end);

      // Move cursor position after tab
      target.selectionStart = target.selectionEnd = start + tabCharacter.length;

      // Trigger onChange because the value was changed programmatically
      onChange(target.value);
    }
  };

  // Shared Editor Content (Toolbar + Write/Preview Tabs)
  const EditorContent = ({isInModal = false}: {isInModal?: boolean}) => (
    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b px-2">
          {/* Formatting Buttons Toolbar */} 
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
            {/* Add Fullscreen button only if NOT in modal */} 
            {!isInModal && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setIsFullScreen(true)} title="Fullscreen">
                    <Maximize className="h-4 w-4" />
                </Button>
            )}
             {/* Add Close button only if IN modal */} 
            {isInModal && (
                <DialogClose asChild>
                     <Button type="button" variant="ghost" size="icon" title="Exit Fullscreen">
                        <Minimize className="h-4 w-4" /> 
                    </Button>
                </DialogClose>
            )}
          </div>

          {/* Write/Preview Tabs */} 
          <TabsList>
            <TabsTrigger value="write" className="flex items-center gap-1">
              <EyeOff className="h-4 w-4" /> Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Eye className="h-4 w-4" /> Preview
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Write Tab Content */} 
        <TabsContent value="write" className="p-0 mt-0">
          <Textarea
            ref={textareaRef} // Keep ref if needed, maybe use separate refs for normal/modal?
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown} // <-- Add key down handler
            placeholder={placeholder}
            className={cn(
                "resize-y border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                isInModal ? "min-h-[70vh] h-[75vh]" : "min-h-[300px]" // <-- Adjust height for modal
            )}
          />
        </TabsContent>

        {/* Preview Tab Content */} 
        <TabsContent value="preview" className={cn("p-4 prose prose-sm max-w-none mt-0", isInModal ? "min-h-[70vh] h-[75vh] overflow-y-auto" : "min-h-[300px]")}> 
          <div dangerouslySetInnerHTML={{ __html: markdownToHtml(value) }} />
        </TabsContent>
      </Tabs>
  )

  return (
    <div className={cn("border rounded-md", className)}>
      {/* Render standard editor */} 
      <EditorContent isInModal={false} />

      {/* Link Dialog */} 
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

      {/* Image Dialog */} 
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

      {/* Image Gallery Picker */} 
      <ImageGalleryPicker
        open={galleryPickerOpen}
        onOpenChange={setGalleryPickerOpen}
        onSelectImage={insertGalleryImage}
      />

      {/* Fullscreen Dialog */} 
      <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
        <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0">
          {/* Render editor content inside the modal */} 
          <EditorContent isInModal={true} /> 
        </DialogContent>
      </Dialog>
    </div>
  )
}
