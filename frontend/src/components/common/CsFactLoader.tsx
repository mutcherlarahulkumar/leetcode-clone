import { useEffect, useState } from "react";
import { FiCode } from "react-icons/fi";
import { cn } from "@lecode/lib/utils";

// Loading screens double as micro-learning, like many dev tools do.
const FACTS = [
  "Binary search halves the search space each step — 1,000,000 items in ~20 comparisons.",
  "A hash map gives O(1) average lookups, which is why it shows up in so many optimal solutions.",
  "The first 'bug' was a real moth, found taped in Harvard's Mark II logbook in 1947.",
  "Big-O describes growth, not speed: an O(n) algorithm can beat an O(log n) one on small inputs.",
  "Recursion and iteration are equivalent — any recursion can be rewritten with an explicit stack.",
  "Quicksort averages O(n log n) but degrades to O(n²) on already-sorted input without good pivots.",
  "Two pointers turn many O(n²) array problems into a single O(n) pass.",
  "Memoization trades memory for time — caching subproblems is the heart of dynamic programming.",
  "A balanced binary tree of height h holds up to 2^(h+1) − 1 nodes.",
  "Hash collisions are unavoidable: the pigeonhole principle guarantees them once inputs exceed buckets.",
  "Depth-first search uses a stack; breadth-first search uses a queue. That one swap changes everything.",
  "Bit tricks: x & (x - 1) clears the lowest set bit — handy for counting bits.",
  "The halting problem proves no program can decide, in general, whether another program will stop.",
  "Amortized analysis is why a dynamic array's push is O(1) on average despite occasional resizes.",
  "A stack is LIFO, a queue is FIFO — most traversal bugs come from picking the wrong one.",
  "Sorting first is often the cheapest way to unlock an O(n log n) solution to a hard-looking problem.",
];

export function CsFactLoader({ className }: { className?: string }) {
  const [i, setI] = useState(() => Math.floor(Math.random() * FACTS.length));

  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % FACTS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center gap-6 p-8 text-center",
        className,
      )}
    >
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-muted" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-primary [animation-duration:900ms]" />
        <FiCode className="absolute inset-0 m-auto h-5 w-5 text-primary" />
      </div>

      <div className="max-w-md space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[hsl(var(--info))]">
          Did you know?
        </p>
        <p
          key={i}
          className="text-sm leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-500"
        >
          {FACTS[i]}
        </p>
      </div>
    </div>
  );
}
