"use client"

import { useState, useRef, useCallback, KeyboardEvent, RefObject, memo } from "react"
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

// Helper function (can be outside components)
const convertMarkdownToHtml = (markdown: string) => {
  let html = markdown
    .replace(/^### (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h2>$1</h2>")
    .replace(/^# (.*$)/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^\s*-\s(.*$)/gm, "<li>$1</li>")
    .replace(/^\s*\d+\.\s(.*$)/gm, "<li>$1</li>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n\n/g, "</p><p>")

  html = "<p>" + html + "</p>"

  html = html.replace(/<li>(.*?)<\/li>/g, (match: string): string => {
    if (html.indexOf("<ul>") === -1 && html.indexOf("<ol>") === -1) {
        if (/^\s*-/.test(markdown)) {
            return "<ul>" + match + "</ul>";
        } else if (/^\s*\d+\./.test(markdown)) {
            return "<ol>" + match + "</ol>";
        }
        return match;
    }
    return match;
  })
  // Wrap adjacent <li> into <ul> or <ol>
  html = html.replace(/(<ul>)?(<li>.*?<\/li>)+(<\/ul>)?/g, (match, p1, p2, p3) => {
    if (p1 && p3) return match; // Already wrapped
    const listItems = match.match(/<li>.*?<\/li>/g)?.join('') || '';
    if (match.includes("<ol><li>")) return `<ol>${listItems}</ol>`;
    return `<ul>${listItems}</ul>`;
  });

  // Clean up paragraph tags that might have been wrongly inserted around lists
  html = html.replace(/<p><(ul|ol)>/g, "<$1>");
  html = html.replace(/<\/(ul|ol)><\/p>/g, "</$1>");
  // Remove empty paragraphs that might result from \n\n processing if they are truly empty
  html = html.replace(/<p>\s*<\/p>/g, "");
  html = html.replace(/<p><\/p>/g, "");

  return html
}

interface EditorDisplayProps {
  value: string;
  onValueChange: (value: string) => void;
  activeTab: "write" | "preview";
  onActiveTabChange: (tab: "write" | "preview") => void;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onTextareaKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  markdownToHtml: (markdown: string) => string;
  toolbarHandlers: {
    handleBold: () => void;
    handleItalic: () => void;
    handleHeading: () => void;
    handleLink: () => void;
    handleImage: () => void;
    handleGalleryImage: () => void;
    handleList: () => void;
    handleOrderedList: () => void;
    handleCode: () => void;
    handleAlignLeft: () => void;
    handleAlignCenter: () => void;
    handleAlignRight: () => void;
    handleUndo: () => void;
    handleRedo: () => void;
  };
  isInModal?: boolean;
  onToggleFullScreen?: () => void;
}

const EditorDisplay = memo(({
  value,
  onValueChange,
  activeTab,
  onActiveTabChange,
  textareaRef,
  onTextareaKeyDown,
  placeholder,
  markdownToHtml,
  toolbarHandlers,
  isInModal = false,
  onToggleFullScreen,
}: EditorDisplayProps) => {
  return (
    <Tabs value={activeTab} onValueChange={(value) => onActiveTabChange(value as "write" | "preview")}>
        <div className="flex items-center justify-between border-b px-2">
          <div className="flex flex-wrap items-center gap-1 p-1">
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleBold} title="Bold">
              <Bold className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleItalic} title="Italic">
              <Italic className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleHeading} title="Heading">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleLink} title="Link">
              <Link className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleImage} title="Image URL">
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleGalleryImage} title="Image from Gallery">
              <ImageIcon className="h-4 w-4 text-blue-500" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleList} title="Unordered List">
              <List className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleOrderedList} title="Ordered List">
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleCode} title="Code">
              <Code className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleAlignLeft} title="Align Left">
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleAlignCenter} title="Align Center">
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleAlignRight} title="Align Right">
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleUndo} title="Undo">
              <Undo className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleRedo} title="Redo">
              <Redo className="h-4 w-4" />
            </Button>
            {!isInModal && onToggleFullScreen && (
                <Button type="button" variant="ghost" size="icon" onClick={onToggleFullScreen} title="Fullscreen">
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
            onChange={(e) => onValueChange(e.target.value)}
            onKeyDown={onTextareaKeyDown}
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
});
EditorDisplay.displayName = 'EditorDisplay';

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

  const getActiveTextareaRef = useCallback((): RefObject<HTMLTextAreaElement | null> => {
    return isFullScreen ? textareaRefModal : textareaRefNormal;
  }, [isFullScreen, textareaRefNormal, textareaRefModal]);

  const getSelectedText = useCallback(() => {
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return ""
    const start = activeRef.current.selectionStart
    const end = activeRef.current.selectionEnd
    return value.substring(start, end)
  }, [value, getActiveTextareaRef]);

  const insertText = useCallback((before: string, after = "") => {
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return

    const start = activeRef.current.selectionStart
    const end = activeRef.current.selectionEnd
    const selected = value.substring(start, end) // Use value from state
    const newText = value.substring(0, start) + before + selected + after + value.substring(end)

    onChange(newText)

    setTimeout(() => {
      const refToFocus = getActiveTextareaRef();
      if (!refToFocus.current) return
      const newCursorPos = start + before.length + selected.length + after.length;
      refToFocus.current.focus()
      refToFocus.current.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange, getActiveTextareaRef]);

  const handleBold = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("**", "**")
    } else {
      insertText("**Bold text**")
    }
  }, [getSelectedText, insertText]);

  const handleItalic = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("*", "*")
    } else {
      insertText("*Italic text*")
    }
  }, [getSelectedText, insertText]);

  const handleHeading = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("## ", "")
    } else {
      insertText("## Heading")
    }
  }, [getSelectedText, insertText]);

  const handleList = useCallback(() => {
    insertText("\\n- List item 1\\n- List item 2\\n- List item 3\\n")
  }, [insertText]);

  const handleOrderedList = useCallback(() => {
    insertText("\\n1. List item 1\\n2. List item 2\\n3. List item 3\\n")
  }, [insertText]);

  const handleCode = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("`", "`")
    } else {
      insertText("`code`")
    }
  }, [getSelectedText, insertText]);

  const handleLink = useCallback(() => {
    const selectedText = getSelectedText()
    setLinkText(selectedText)
    setLinkDialogOpen(true)
  }, [getSelectedText]);

  const insertLink = useCallback(() => {
    if (linkUrl) {
      const linkMarkdown = `[${linkText || linkUrl}](${linkUrl})`
      insertText(linkMarkdown)
      setLinkDialogOpen(false)
      setLinkUrl("")
      setLinkText("")
    }
  }, [linkUrl, linkText, insertText]);

  const handleImage = useCallback(() => {
    setImageDialogOpen(true)
  }, []);

  const insertImage = useCallback(() => {
    if (imageUrl) {
      const imageMarkdown = `![${imageAlt}](${imageUrl})`
      insertText(imageMarkdown)
      setImageDialogOpen(false)
      setImageUrl("")
      setImageAlt("")
    }
  }, [imageUrl, imageAlt, insertText]);

  const handleGalleryImage = useCallback(() => {
    setGalleryPickerOpen(true)
  }, []);

  const insertGalleryImage = useCallback((url: string, alt: string) => {
    const imageMarkdown = `![${alt}](${url})`
    insertText(imageMarkdown)
  }, [insertText]);

  const handleAlignLeft = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: left;">\\n\\n${selectedText}\\n\\n</div>`)
    } else {
      insertText(`<div style="text-align: left;">\\n\\nAligned Text\\n\\n</div>`)
    }
  }, [getSelectedText, insertText]);

  const handleAlignCenter = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: center;">\\n\\n${selectedText}\\n\\n</div>`)
    } else {
      insertText(`<div style="text-align: center;">\\n\\nAligned Text\\n\\n</div>`)
    }
  }, [getSelectedText, insertText]);

  const handleAlignRight = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText(`<div style="text-align: right;">\\n\\n${selectedText}\\n\\n</div>`)
    } else {
      insertText(`<div style="text-align: right;">\\n\\nAligned Text\\n\\n</div>`)
    }
  }, [getSelectedText, insertText]);

  const handleUndo = useCallback(() => {
    const activeRef = getActiveTextareaRef();
    if (activeRef.current) {
      activeRef.current.focus()
      document.execCommand("undo")
    }
  }, [getActiveTextareaRef]);

  const handleRedo = useCallback(() => {
    const activeRef = getActiveTextareaRef();
    if (activeRef.current) {
      activeRef.current.focus()
      document.execCommand("redo")
    }
  }, [getActiveTextareaRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();

      const textarea = getActiveTextareaRef().current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const tabCharacter = '\\t';
      
      const currentValue = value; // Use value from state
      const newValue = currentValue.substring(0, start) + tabCharacter + currentValue.substring(end);
      
      onChange(newValue);

      setTimeout(() => {
        const currentTextarea = getActiveTextareaRef().current;
        if (currentTextarea) {
            currentTextarea.focus();
            const newCursorPos = start + tabCharacter.length;
            currentTextarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    // Add other key handling logic if needed, e.g. for Backspace if it has specific issues.
    // console.log("Key down:", event.key, "in", isFullScreen ? "modal" : "normal"); // For debugging
  }, [value, onChange, getActiveTextareaRef, isFullScreen]); // isFullScreen needed if logs use it, or getActiveTextareaRef changes with it.

  const toolbarHandlers = {
    handleBold,
    handleItalic,
    handleHeading,
    handleLink,
    handleImage,
    handleGalleryImage,
    handleList,
    handleOrderedList,
    handleCode,
    handleAlignLeft,
    handleAlignCenter,
    handleAlignRight,
    handleUndo,
    handleRedo,
  };

  const onToggleFullScreen = useCallback(() => setIsFullScreen(true), []);
  const onActiveTabChange = useCallback((tab: "write" | "preview") => setActiveTab(tab), []);
  const onValueChange = onChange; // Direct pass through for the main text area onChange

  return (
    <div className={cn("border rounded-md", className)}>
      <EditorDisplay
        value={value}
        onValueChange={onValueChange}
        activeTab={activeTab}
        onActiveTabChange={onActiveTabChange}
        textareaRef={textareaRefNormal}
        onTextareaKeyDown={handleKeyDown}
        placeholder={placeholder}
        markdownToHtml={convertMarkdownToHtml}
        toolbarHandlers={toolbarHandlers}
        isInModal={false}
        onToggleFullScreen={onToggleFullScreen}
      />

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
           <EditorDisplay
            value={value}
            onValueChange={onValueChange}
            activeTab={activeTab}
            onActiveTabChange={onActiveTabChange}
            textareaRef={textareaRefModal}
            onTextareaKeyDown={handleKeyDown}
            placeholder={placeholder}
            markdownToHtml={convertMarkdownToHtml}
            toolbarHandlers={toolbarHandlers}
            isInModal={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
