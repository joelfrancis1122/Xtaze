import { useEffect, useRef, useState } from "react";
import "./Cursor.css";

const Cursor = () => {
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorOutlineRef = useRef<HTMLDivElement | null>(null);
  const [isCursorVisible, setIsCursorVisible] = useState(true); // Track cursor visibility

  useEffect(() => {
    let posX = 0, posY = 0;
    let outlineX = 0, outlineY = 0;
    const speed = 0.1; // Adjust speed of the outline lag

    const moveCursor = (e: MouseEvent) => {
      posX = e.clientX;
      posY = e.clientY;

      // Check if cursor is within the window bounds
      const isInsideWindow =
        posX >= 0 && posX <= window.innerWidth && posY >= 0 && posY <= window.innerHeight;

      setIsCursorVisible(isInsideWindow); // Set visibility state based on cursor position

      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${posX}px`;
        cursorDotRef.current.style.top = `${posY}px`;
      }
    };

    const animateOutline = () => {
      outlineX += (posX - outlineX) * speed;
      outlineY += (posY - outlineY) * speed;

      if (cursorOutlineRef.current) {
        cursorOutlineRef.current.style.left = `${outlineX}px`;
        cursorOutlineRef.current.style.top = `${outlineY}px`;
      }

      requestAnimationFrame(animateOutline);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseout", () => setIsCursorVisible(false)); // Hide cursor when mouse leaves window
    window.addEventListener("mouseover", () => setIsCursorVisible(true)); // Show cursor when mouse enters window
    animateOutline(); // Start animation loop

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseout", () => setIsCursorVisible(false));
      window.removeEventListener("mouseover", () => setIsCursorVisible(true));
    };
  }, []);

  return (
    <>
      {/* Cursor Dot */}
      <div
        className="cursor-dot"
        ref={cursorDotRef}
        style={{
          display: isCursorVisible ? "block" : "none", // Hide when outside the window
        }}
      />
      {/* Cursor Outline */}
      <div
        className="cursor-outline"
        ref={cursorOutlineRef}
        style={{
          display: isCursorVisible ? "block" : "none", // Hide when outside the window
        }}
      />
    </>
  );
};

export default Cursor;
