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
  Heading1,
  Heading3,
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
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w-]+/g, "") // Remove all non-word chars but hyphens
      .replace(/--+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text

  let html = markdown
    // Block-level elements first
    .replace(/^>\s+(.*$)/gm, "<blockquote>$1</blockquote>") // Blockquotes
    .replace(/^(?:---|\*\*\*|___)\s*$/gm, "<hr />") // Horizontal Rules
    .replace(/^###\s+(.*$)/gm, (match, content) => {
      const slug = slugify(content);
      return `<h3 id=\"h3-${slug}\">${content}</h3>`;
    })
    .replace(/^##\s+(.*$)/gm, (match, content) => {
      const slug = slugify(content);
      return `<h2 id=\"h2-${slug}\">${content}</h2>`;
    })
    .replace(/^#\s+(.*$)/gm, (match, content) => {
      const slug = slugify(content);
      return `<h1 id=\"h1-${slug}\">${content}</h1>`;
    })
    // Fenced code blocks
    .replace(/^```(\w*)\n([\s\S]*?)\n```$/gm, (match, lang, code) => {
      const languageClass = lang ? `language-${lang}` : 'language-none';
      // Basic HTML escaping for code content
      const escapedCode = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
      return `<pre><code class="${languageClass}">${escapedCode}</code></pre>`;
    })
    // Inline elements
    .replace(/\\*\\*(.*?)\\*\\*/g, "<strong>$1</strong>") // Bold
    .replace(/\\*(.*?)\\*/g, "<em>$1</em>")           // Italic
    .replace(/~~(.*?)~~/g, "<del>$1</del>")         // Strikethrough
    .replace(/!\\[(.*?)\\]\\((.*?)\\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />') // Image
    .replace(/\\\[(.*?)\\\]\\((.*?)\\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')    // Link
    .replace(/`([^`]+?)`/g, "<code>$1</code>")        // Inline Code
    // List items (handled later with more complex logic for wrapping in <ul>/<ol>)
    .replace(/^\\s*-\\s(.*$)/gm, "<li>$1</li>")
    .replace(/^\\s*\\d+\\.\\s(.*$)/gm, "<li>$1</li>")
    // Paragraphs - replace double newlines with paragraph tags
    // Ensure this runs after block elements like code blocks and HRs to avoid interference
    .replace(/\n\n/g, "</p><p>");

  // Wrap orphaned li tags and the initial content in <p> tags
  // Check if the content starts with a block element already, if not, wrap in <p>
  if (!html.match(/^<(h[1-6]|ul|ol|li|blockquote|hr|pre|p)/)) {
    html = "<p>" + html;
  }
  // Check if the content ends with a block element already, if not, wrap in </p>
  if (!html.match(/<\/(h[1-6]|ul|ol|li|blockquote|hr|pre|p)>$/)) {
    html = html + "</p>";
  }
  // Remove empty paragraphs <p></p> or <p>\s*</p>
  html = html.replace(/<p>\s*<\/p>/g, "");

  // Consolidate list items into <ul> and <ol> tags
  // This is a simplified approach; more robust parsing might be needed for nested lists or mixed lists.
  html = html.replace(/<li>(.*?)<\/li>(?=\s*<li>)/g, '<li>$1</li>\n'); // Ensure newline between <li> for regex
  html = html.replace(/(<li>(?:[^<]*(?:<(?!li|\/li)[^<]*)*)*<\/li>)+/g, (match) => {
    if (match.includes("<ol><li>") || match.startsWith("<li>1.")) { // Basic check for ordered
        return `<ol>${match.replace(/<ol><li>/g, "<li>")}</ol>`;
    }
    return `<ul>${match}</ul>`;
  });

  // Clean up paragraphs around lists or other block elements
  html = html.replace(/<\/p>\s*<(ul|ol|blockquote|hr|pre)>/g, "<$1>");
  html = html.replace(/<\/(ul|ol|blockquote|hr|pre)>\s*<p>/g, "</$1>");

  return html;
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
    handleH1: () => void;
    handleH3: () => void;
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
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleH1} title="Heading 1">
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleHeading} title="Heading 2">
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" onClick={toolbarHandlers.handleH3} title="Heading 3">
              <Heading3 className="h-4 w-4" />
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

  const handleH1 = useCallback(() => {
    const selectedText = getSelectedText();
    if (selectedText) {
      insertText("# ", "");
    } else {
      insertText("# Heading 1");
    }
  }, [getSelectedText, insertText]);

  const handleHeading = useCallback(() => {
    const selectedText = getSelectedText()
    if (selectedText) {
      insertText("## ", "")
    } else {
      insertText("## Heading 2")
    }
  }, [getSelectedText, insertText]);

  const handleH3 = useCallback(() => {
    const selectedText = getSelectedText();
    if (selectedText) {
      insertText("### ", "");
    } else {
      insertText("### Heading 3");
    }
  }, [getSelectedText, insertText]);

  const handleList = useCallback(() => {
    const selectedText = getSelectedText();
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return;
    const { selectionStart, value: editorValue } = activeRef.current;

    if (selectedText) {
      const lines = selectedText.split('\n');
      const newLines = lines.map(line => line.trim() === '' ? line : `- ${line}`);
      insertText(newLines.join('\n'), "");
    } else {
      const charBefore = editorValue.substring(selectionStart - 1, selectionStart);
      if (selectionStart === 0 || charBefore === '\n') {
        insertText("- ", "");
      } else {
        insertText("\n- ", "");
      }
    }
  }, [getSelectedText, insertText, getActiveTextareaRef]);

  const handleOrderedList = useCallback(() => {
    const selectedText = getSelectedText();
    const activeRef = getActiveTextareaRef();
    if (!activeRef.current) return;
    const { selectionStart, value: editorValue } = activeRef.current;

    if (selectedText) {
      const lines = selectedText.split('\n');
      // Basic numbering, doesn't account for existing list numbers yet
      const newLines = lines.map((line, index) => line.trim() === '' ? line : `${index + 1}. ${line}`);
      insertText(newLines.join('\n'), "");
    } else {
      const charBefore = editorValue.substring(selectionStart - 1, selectionStart);
      if (selectionStart === 0 || charBefore === '\n') {
        insertText("1. ", "");
      } else {
        insertText("\n1. ", "");
      }
    }
  }, [getSelectedText, insertText, getActiveTextareaRef]);

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
    const selectedText = getSelectedText();
    insertText(`<div style=\"text-align: left;\">`, `</div>`);
  }, [getSelectedText, insertText]);

  const handleAlignCenter = useCallback(() => {
    const selectedText = getSelectedText();
    insertText(`<div style=\"text-align: center;\">`, `</div>`);
  }, [getSelectedText, insertText]);

  const handleAlignRight = useCallback(() => {
    const selectedText = getSelectedText();
    insertText(`<div style=\"text-align: right;\">`, `</div>`);
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
    handleH1,
    handleHeading,
    handleH3,
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
