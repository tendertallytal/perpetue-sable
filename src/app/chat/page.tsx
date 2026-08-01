/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import CloudBlob, { CLOUD_CLIP_ID } from './cloud-blob';
import DraggableImage from './draggable-image';
import LineArt from './line-art';
import Starburst from './starburst';
import { SYSTEM_PROMPT } from './prompt';
import { useDraggable } from './use-draggable';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: SYSTEM_PROMPT, id: 'system-prompt' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  // Typing inside the panel shouldn't drag it.
  const {
    offset: drag,
    dragging,
    dragProps,
  } = useDraggable({ ignoreSelector: 'input, button, textarea' });

  // Where the dashed line should end: the box's bottom-left corner, in px.
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  // The starburst can be shoved around too, so it has to tell a drag from a click.
  const {
    dragging: burstDragging,
    dragProps: burstDragProps,
    takeDragged: burstTakeDragged,
  } = useDraggable();

  const transcriptRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const conversation = messages.slice(1);

  // A reply is meant to be read from its first line, so park that line at the
  // top of the box rather than scrolling to the end of what she said.
  useEffect(() => {
    const box = transcriptRef.current;
    if (!box) return;

    // Smooth scrolling is animation-driven, so it silently does nothing in a
    // background tab — and she takes long enough to answer that people do look
    // away. Jump outright when we can't animate.
    const behavior: ScrollBehavior =
      document.visibilityState === 'visible' ? 'smooth' : 'auto';

    const latest = messages[messages.length - 1];
    if (latest?.role === 'assistant') {
      const replies = box.querySelectorAll<HTMLElement>('[data-reply]');
      const newest = replies[replies.length - 1];
      if (newest) {
        const padding = parseFloat(getComputedStyle(box).paddingTop) || 0;
        box.scrollTo({ top: Math.max(0, newest.offsetTop - padding), behavior });
        return;
      }
    }

    // Anything else — the viewer's own line, the watch appearing — ends at the bottom.
    box.scrollTo({ top: box.scrollHeight, behavior });
    // `messages` only changes when something is actually said, so typing in the
    // input can't yank the view away from what the reader is reading.
  }, [messages, isLoading]);

  // Attach the camera stream once the <video> has been mounted.
  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraOn]);

  // Never leave the camera running behind us.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Just start typing — no need to find and click the little pill first.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const active = document.activeElement;
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
        return;
      }

      // A printable character or a correction — anything else is a shortcut.
      if (e.key.length === 1 || e.key === 'Backspace') {
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Keep the dashed line fastened to the box wherever it has been dragged to.
  const measureAnchor = useCallback(() => {
    const el = transcriptRef.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    setAnchor({ x: box.left, y: box.bottom });
  }, []);

  useLayoutEffect(() => {
    measureAnchor();
  }, [measureAnchor, drag, messages]);

  useEffect(() => {
    window.addEventListener('resize', measureAnchor);
    return () => window.removeEventListener('resize', measureAnchor);
  }, [measureAnchor]);

  const toggleCamera = async () => {
    if (cameraOn) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
      return;
    }

    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
      });
      setCameraOn(true);
    } catch {
      // Permission refused or no camera: the background simply stays white.
      streamRef.current = null;
      setCameraOn(false);
    }
  };

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text,
      id: `user-${Date.now()}`,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const assistantMessage = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: assistantMessage.content,
          id: `assistant-${Date.now()}`,
        },
      ]);
    } catch (error) {
      console.error('Error getting completion:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'the line went quiet. ask me again.',
          id: `error-${Date.now()}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send();
  };

  // Enter is the primary way in, so it drives the send directly rather than
  // leaning on the form's implicit submission.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void send();
    }
  };

  return (
    <main
      data-fullscreen
      className="relative h-dvh w-screen overflow-hidden bg-white font-oswald"
    >
      {/* The viewer's own face, once they ask to know who they are. */}
      {cameraOn && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 z-0 h-full w-full -scale-x-100 object-cover"
        />
      )}

      <div className="pointer-events-none absolute inset-0 z-10">
        <LineArt />
      </div>

      {/* ---- the scene ----
          Kept in its own clipping layer: several pieces deliberately bleed past
          the edges, and without this the focused input would scroll them. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Perpétue and the flowering branch stay put — the scene hangs off them. */}
        <img
          src="/assets/blossom-branch.gif"
          alt=""
          aria-hidden="true"
          className="absolute -top-[4vh] -left-[2vw] z-20 w-[95vw] max-w-none lg:-top-[7vh] lg:w-[50vw]"
        />
        <DraggableImage
          src="/assets/willow.gif"
          alt=""
          className="absolute -right-[10vw] top-[30vh] z-20 h-[60vh] max-w-none lg:-right-[14vw] lg:-top-[4vh] lg:h-[112vh]"
        />
        <DraggableImage
          src="/assets/rocks.png"
          alt=""
          className="absolute bottom-0 -left-[6vw] z-30 w-[120vw] max-w-none lg:-left-[2vw] lg:w-[62vw]"
        />
        <img
          src="/assets/doll.png"
          alt="Perpétue Sablé, a small cloth doll with wild black hair, seated on the rocks"
          className="absolute bottom-[4vh] left-[8vw] z-40 h-[28vh] max-w-none lg:bottom-[1vh] lg:left-[16vw] lg:h-[47vh]"
        />
        <DraggableImage
          src="/assets/lotus.gif"
          alt=""
          className="absolute bottom-[2vh] left-[46vw] z-40 w-[44vw] max-w-none lg:bottom-[3vh] lg:left-[60vw] lg:w-[29vw]"
        />
      </div>

      {/* The line tying Perpétue to the words she is saying. */}
      <svg
        className="pointer-events-none absolute inset-0 z-40 hidden h-full w-full lg:block"
        aria-hidden="true"
      >
        {anchor && (
          <line
            x1="31%"
            y1="72%"
            x2={anchor.x}
            y2={anchor.y}
            stroke="#ec13d2"
            strokeWidth="5"
            strokeDasharray="26 18"
          />
        )}
      </svg>

      {/* ---- what she says ---- */}
      <div
        {...dragProps}
        className={`absolute left-[4vw] right-[4vw] top-[4vh] z-[60] flex flex-col gap-3 lg:left-auto lg:right-[28vw] lg:top-[1vh] lg:w-[37vw] lg:touch-none ${
          dragging ? 'cursor-grabbing select-none' : 'cursor-grab'
        }`}
      >
        <div className="relative h-[30vh] lg:h-[38vh]">
          <CloudBlob className="absolute inset-0 h-full w-full" />
          <div
            ref={transcriptRef}
            style={{ clipPath: `url(#${CLOUD_CLIP_ID})` }}
            className="scroll-thin absolute inset-0 overflow-y-auto px-[15%] py-[17%]"
          >
            {conversation.length === 0 && !isLoading && (
              <p className="text-base leading-snug text-hotpink opacity-80 lg:text-xl">
                It is always 4 November 1953. and my brain is always missing.
                Help me find my brain please. Or just say something.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {conversation.map((message) =>
                message.role === 'assistant' ? (
                  <p
                    key={message.id}
                    data-reply
                    className="animate-fade-in whitespace-pre-wrap text-base font-light leading-snug text-hotpink lg:text-xl"
                  >
                    {message.content}
                  </p>
                ) : (
                  <p
                    key={message.id}
                    className="animate-fade-in self-end whitespace-pre-wrap text-right text-sm font-light leading-snug text-black"
                  >
                    {message.content}
                  </p>
                )
              )}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex justify-center">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ask perpétue…"
            disabled={isLoading}
            autoFocus
            aria-label="Ask Perpétue"
            className="w-[70%] cursor-text rounded-full border-2 border-pink-500 bg-pink-400/60 px-6 py-3 text-base font-light text-hotpink lg:w-[56%] lg:px-8 lg:text-lg placeholder:text-hotpink placeholder:opacity-60 focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:cursor-wait disabled:placeholder:opacity-25"
          />
          {/* Kept out of the scene, but it makes Enter submit reliably and gives
              keyboard and screen-reader users something to activate. */}
          <button type="submit" className="sr-only" disabled={isLoading}>
            Send
          </button>
        </form>
      </div>

      {/* Her brain is somewhere around 1980; while she reaches for it, the watch swings. */}
      {isLoading && (
        <img
          src="/assets/pocket-watch.gif"
          alt="Perpétue is thinking"
          className="animate-sway pointer-events-none absolute -top-[2vh] left-[6vw] z-50 h-[34vh] max-w-none lg:-top-[4vh] lg:left-[36vw] lg:h-[46vh]"
        />
      )}

      {/* ---- the mirror ---- */}
      <button
        type="button"
        onClick={() => {
          // The pointer travelled: that was a drag, not a request for a mirror.
          if (burstTakeDragged()) return;
          void toggleCamera();
        }}
        {...burstDragProps}
        className={`absolute left-[2vw] top-[46vh] z-50 grid h-[25.92vw] w-[25.92vw] touch-none select-none place-items-center lg:left-[1vw] lg:top-[21vh] lg:h-[11.52vw] lg:w-[11.52vw] ${
          burstDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <Starburst className="absolute inset-0 h-full w-full" />
        {/* Sized so no line reaches past the star's notches — the text column is
            narrower than it looks it could be for exactly that reason. */}
        <span className="relative max-w-[66%] text-center font-pinyon text-[8.5px] lowercase leading-[1.15] text-hotpink sm:text-[11px] lg:text-[18px]">
          {cameraOn
            ? 'click to go back to not knowing.'
            : 'click to know who you are. this is how you know to be free.'}
        </span>
      </button>
    </main>
  );
}
