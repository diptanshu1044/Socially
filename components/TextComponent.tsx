"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";

interface TextComponentProps {
  content?: string | null;
}

export const TextComponent = ({ content }: TextComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    // Check if content height exceeds max-h-12 (48px)
    if (contentRef.current) {
      const contentHeight = contentRef.current.scrollHeight;
      setShowButton(contentHeight > 48); // 48px = max-h-12
    }
  }, [content]); // Re-run when content changes

  return (
    <div>
      <div
        ref={contentRef}
        className={`overflow-hidden ${isExpanded ? "max-h-none" : "max-h-12"}`}
      >
        {content}
      </div>
      {showButton && (
        <Button variant="link" onClick={toggleExpand}>
          {isExpanded ? "See Less" : "See More"}
        </Button>
      )}
    </div>
  );
};
