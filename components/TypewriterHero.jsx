'use client';

import { useEffect, useState } from 'react';

const words = [
  'Lower bills.',
  'Go eco-friendly.',
  'Enjoy savings.',
  'Reduce waste.',
];

export default function TypewriterHero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentWord = words[wordIndex];

  useEffect(() => {
    let timeout;

    if (!isDeleting && charIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev + 1);
      }, 35);
    }
    else if (!isDeleting && charIndex === currentWord.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 800);
    }
    else if (isDeleting && charIndex > 0) {
      timeout = setTimeout(() => {
        setCharIndex((prev) => prev - 1);
      }, 20);
    }
    else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentWord]);

  return (
    <span className="text-brand inline-block min-w-[16ch]">
      {currentWord.slice(0, charIndex)}
      <span className="animate-pulse">|</span>
    </span>
  );
}