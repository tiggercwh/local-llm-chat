"use client";

import { useState, ComponentPropsWithoutRef, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock = memo(function CodeBlock({ language, value }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const highlighterProps = {
    language,
    style: oneDark,
    customStyle: {
      margin: 0,
      padding: "1rem",
    },
    showLineNumbers: true,
  };

  return (
    <div className="relative my-4">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-gray-200 px-4 py-2 text-sm rounded-t-lg">
        <span>{language || "plain text"}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-6 w-6 hover:bg-gray-700"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter {...highlighterProps}>{value}</SyntaxHighlighter>
    </div>
  );
});

const CodeComponent = ({
  className,
  children,
  ...props
}: ComponentPropsWithoutRef<"code">) => {
  const match = /language-(\w+)/.exec(className || "");

  // Force detecting inline code by checking length and content
  const isInlineCode =
    typeof children === "string" &&
    !children.toString().includes("\n") &&
    children.toString().length < 100;

  return isInlineCode ? (
    <code
      className="px-1.5 py-0.5 rounded-md bg-gray-200 dark:bg-gray-800 font-mono text-sm border border-gray-300 dark:border-gray-700"
      {...props}
    >
      {children}
    </code>
  ) : (
    <CodeBlock
      language={match?.[1] || ""}
      value={String(children).replace(/\n$/, "")}
    />
  );
};

interface MessageProps {
  message: {
    role: string;
    content: string;
  };
}

export function Message({ message }: MessageProps) {
  return (
    <div
      className={`flex w-full min-w-xl mb-4 ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div className="flex items-start gap-2 max-w-3xl">
        <div
          className={`p-1 rounded-full ${
            message.role === "user" ? "bg-blue-500" : "bg-green-500"
          }`}
        >
          <div className="w-8 h-8 flex items-center justify-center text-white font-semibold">
            {message.role === "user" ? "U" : "A"}
          </div>
        </div>

        <Card
          className={`p-4 ${
            message.role === "user"
              ? "bg-blue-50 dark:bg-blue-950"
              : "bg-white dark:bg-gray-900"
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="font-semibold">
              {message.role === "user" ? "You" : "Assistant"}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            {message.role === "user" ? (
              // Plain text for user messages
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              // Markdown for assistant messages
              <ReactMarkdown
                components={{
                  code: CodeComponent,
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
