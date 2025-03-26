import React from "react";
import { DiffEditor } from "@monaco-editor/react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ReadOnlyDiffEditorProps {
  originalCode: string;
  modifiedCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function ReadOnlyDiffEditor({
  originalCode,
  modifiedCode,
  open,
  onOpenChange,
}: ReadOnlyDiffEditorProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <div className="flex-1 overflow-hidden">
          <DiffEditor
            height="100%"
            language="javascript"
            original={originalCode}
            modified={modifiedCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 14,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ReadOnlyDiffEditor;
