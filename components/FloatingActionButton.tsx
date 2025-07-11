"use client";

import { Plus } from "lucide-react";
import { Button } from "./ui/button";

export const FloatingActionButton = () => {
  const handleClick = () => {
    // Scroll to create post section
    document.querySelector('.mobile-card')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'center'
    });
  };

  return (
    <div className="fixed bottom-24 right-4 z-40 lg:hidden safe-padding">
      <Button 
        size="lg" 
        className="w-14 h-14 rounded-full shadow-lg bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 min-h-[56px] min-w-[56px]"
        onClick={handleClick}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}; 