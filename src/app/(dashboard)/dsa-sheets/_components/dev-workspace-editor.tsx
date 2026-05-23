"use client";

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useAuth } from "@clerk/nextjs";
import { 
  FileCode, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DevWorkspaceEditorProps {
  initialNotes: string;
  onSaveNote: (note: string) => void | Promise<any>;
  questionId: string;
}

export function DevWorkspaceEditor({
  initialNotes,
  onSaveNote,
  questionId
}: DevWorkspaceEditorProps) {
  const { userId } = useAuth();
  
  // State variables
  const [content, setContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [copied, setCopied] = useState(false);
  
  // Refs
  const isFirstMount = useRef(true);
  const editorRef = useRef<any>(null);

  // Storage key specific to user & question
  const localStorageKey = `topic:note-draft:${userId || "anon"}:${questionId}`;

  // 1. Initial Load & Local Storage Recovery
  useEffect(() => {
    let dbContent = initialNotes || "";
    
    // Backward compatibility: If notes is a JSON string from the previous multi-tab version, extract notes.tsx content
    if (dbContent.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(dbContent);
        if (parsed && parsed.version === 1 && parsed.files) {
          dbContent = parsed.files["notes.tsx"] || parsed.files["notes.md"] || "";
        }
      } catch (e) {
        // Fallback to initialNotes plaintext if JSON parsing fails
      }
    }
    
    // Check if there is a local draft
    const localDraft = localStorage.getItem(localStorageKey);
    if (localDraft !== null && localDraft !== dbContent) {
      setContent(localDraft);
      setSaveStatus("unsaved");
      toast.success("Restored unsaved changes locally.");
      isFirstMount.current = false;
      return;
    }
    
    setContent(dbContent);
    setSaveStatus("saved");
    isFirstMount.current = true;
  }, [initialNotes, questionId, userId]);

  // 2. Continuous immediate saving to localStorage + Debounced Cloud Sync
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    setSaveStatus("unsaved");
    localStorage.setItem(localStorageKey, content);

    // Debounced autosave to the database (1.5 seconds)
    const timer = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await onSaveNote(content);
        setSaveStatus("saved");
        localStorage.removeItem(localStorageKey);
      } catch (error) {
        setSaveStatus("unsaved");
        console.error("Autosave cloud sync error:", error);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [content]);

  // Handle value change inside Monaco Editor
  const handleEditorChange = (value: string | undefined) => {
    setContent(value || "");
  };

  // Copy code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied notes contents!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy code");
    }
  };

  // Manual save handler (Save Button or Ctrl/Cmd + S)
  const handleManualSave = async () => {
    setSaveStatus("saving");
    try {
      await onSaveNote(content);
      setSaveStatus("saved");
      localStorage.removeItem(localStorageKey);
      toast.success("Saved solution to cloud!");
    } catch (err) {
      setSaveStatus("unsaved");
      toast.error("Failed to save to cloud");
    }
  };

  // Bind Ctrl+S or Cmd+S inside editor and configure diagnostics
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    
    // Disable TypeScript/JavaScript diagnostics (red compiler warning squiggles)
    if (monaco && monaco.languages && monaco.languages.typescript) {
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: true,
        noSyntaxValidation: true,
      });
    }
    
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleManualSave();
    });
  };

  return (
    <div 
      className={cn(
        "flex flex-col border transition-all duration-300 font-mono select-none",
        isFullscreen 
          ? "fixed inset-4 z-[999] bg-[#000000] border-[#333333] shadow-2xl rounded-lg animate-in fade-in zoom-in-95 duration-200" 
          : "h-[500px] bg-[#000000] border-[#222222] rounded-xl overflow-hidden focus-within:border-[#444444]"
      )}
    >
      {/* VS Code Tab Bar */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border-b border-[#151515] h-9 select-none">
        
        {/* Left Side: VS Code-Style Main File Tab */}
        <div className="flex h-full select-none">
          <div className="flex items-center gap-2 px-4 h-full text-xs font-semibold bg-[#000000] text-[#f8f8f2] border-r border-[#151515] border-t-2 border-t-[#007acc] font-sans select-none">
            <FileCode className="w-3.5 h-3.5 text-[#007acc]" />
            <span>notes.tsx</span>
          </div>
        </div>

        {/* Right Side: Low Profile VS Code Actions */}
        <div className="flex items-center gap-1.5 px-3 h-full">
          {/* Quick Manual Save */}
          <button
            onClick={handleManualSave}
            className="p-1 text-[#666666] hover:text-[#f8f8f2] transition-colors cursor-pointer"
            title="Save Solution (Ctrl+S / Cmd+S)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyCode}
            disabled={!content}
            className="p-1 text-[#666666] hover:text-[#f8f8f2] transition-colors cursor-pointer disabled:opacity-20"
            title="Copy Notes"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#50fa7b]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Maximize Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 text-[#666666] hover:text-[#f8f8f2] transition-colors cursor-pointer"
            title={isFullscreen ? "Restore size" : "Maximize editor"}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Frame - High Contrast Black */}
      <div className="flex-1 bg-[#000000] relative min-h-0 select-text">
        <div className="w-full h-full relative select-text">
          <Editor
            height="100%"
            theme="hc-black"
            language="typescript"
            value={content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            loading={
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#000000] gap-2 select-none">
                <div className="w-5 h-5 rounded-full border border-t-transparent border-[#007acc] animate-spin" />
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#555555]">Monaco...</span>
              </div>
            }
            options={{
              fontSize: 13.5,
              fontFamily: "var(--font-mono), 'Fira Code', Fira Mono, Consolas, Menlo, Monaco, 'Courier New', monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              lineDecorationsWidth: 10,
              roundedSelection: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
              scrollbar: {
                vertical: "visible",
                horizontal: "visible",
                verticalScrollbarSize: 9,
                horizontalScrollbarSize: 9,
                useShadows: false,
              },
              guides: {
                indentation: true,
                bracketPairs: true,
              },
              automaticLayout: true,
              readOnly: false,
              domReadOnly: false,
              contextmenu: true,
              renderLineHighlight: "all",
              tabSize: 2,
            }}
          />
        </div>
      </div>

      {/* VS Code Status Bar */}
      <div className="flex items-center justify-between bg-[#0a0a0a] border-t border-[#151515] px-3 h-6 text-[10px] font-sans text-[#666666] tracking-wide select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {saveStatus === "saved" ? (
              <span className="flex items-center gap-1 text-[#50fa7b]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#50fa7b]" />
                Synced
              </span>
            ) : saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-[#007acc]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007acc] animate-ping" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#ffb86c]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb86c]" />
                Unsaved Draft
              </span>
            )}
          </div>
          <span>•</span>
          <span>Ln 1, Col 1</span>
        </div>
        <div className="flex items-center gap-3">
          <span>TYPESCRIPT</span>
          <span>•</span>
          <span>Spaces: 2</span>
          <span>•</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
