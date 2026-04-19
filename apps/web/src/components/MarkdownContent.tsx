"use client";

import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div className="markdown-content prose prose-sm max-w-none text-gray-700 leading-relaxed font-medium">
      <ReactMarkdown
        components={{
          // Professional blue links for merchant site
          a: ({ node, ...props }) => (
            <a 
              {...props} 
              className="text-blue-600 hover:text-blue-800 underline decoration-blue-200 underline-offset-4 font-bold transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          // Clean, minimalist bullets
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-5 mt-4 space-y-2 mb-6" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-5 mt-4 space-y-2 mb-6" />
          ),
          li: ({ node, ...props }) => (
            <li {...props} className="marker:text-gray-300" />
          ),
          // Strong text alignment with Slickdeals
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-black text-gray-900" />
          ),
          // Paragraph spacing
          p: ({ node, ...props }) => (
            <p {...props} className="mb-4" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
