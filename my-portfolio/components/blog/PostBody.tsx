/* eslint-disable @next/next/no-img-element -- markdown images have unknown
   dimensions and are served directly to avoid the Next image optimizer's
   per-request runtime cost. */
import type { ReactNode } from "react";

/**
 * A dependency-free markdown renderer for blog posts. Supports the common
 * subset produced by the Obsidian publish pipeline: headings (#–####),
 * paragraphs, unordered + ordered lists, fenced code blocks, inline code,
 * bold/italic, links, images, blockquotes and callouts, and horizontal rules.
 *
 * Content comes from trusted local markdown files; React escapes all text
 * children automatically. For richer CommonMark support, swap this for
 * react-markdown + rehype later — the loader and pipeline stay the same.
 */

// ---------- Inline rendering ----------

function renderEmphasis(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // Order matters: images, links, bold, italic.
  const regex =
    /(!\[[^\]]*\]\([^)]+\)|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index));
    const token = match[0];
    const key = `${keyPrefix}-e${i++}`;

    if (token.startsWith("![")) {
      const m = token.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (m) {
        nodes.push(
          <img
            key={key}
            src={m[2]}
            alt={m[1]}
            className="my-6 w-full rounded-[var(--radius-card)] border border-border"
            loading="lazy"
          />
        );
      }
    } else if (token.startsWith("[")) {
      const m = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) {
        const external = /^https?:\/\//.test(m[2]);
        nodes.push(
          <a
            key={key}
            href={m[2]}
            {...(external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {m[1]}
          </a>
        );
      }
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) nodes.push(text.slice(lastIndex));
  return nodes;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  // Split out inline code spans first so their contents are never re-parsed.
  const nodes: ReactNode[] = [];
  const codeRegex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        ...renderEmphasis(text.slice(lastIndex, match.index), `${keyPrefix}-${i}`)
      );
    }
    nodes.push(
      <code
        key={`${keyPrefix}-c${i++}`}
        className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.85em]"
      >
        {match[1]}
      </code>
    );
    lastIndex = codeRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(...renderEmphasis(text.slice(lastIndex), `${keyPrefix}-${i}`));
  }
  return nodes;
}

// ---------- Block parsing ----------

const HR = /^(-{3,}|\*{3,}|_{3,})$/;
const HEADING = /^(#{1,4})\s+(.*)$/;
const UL_ITEM = /^\s*[-*]\s+(.*)$/;
const OL_ITEM = /^\s*\d+\.\s+(.*)$/;
const IMAGE_ONLY = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const CALLOUT = /^>\s*\[!(\w+)\]\s*(.*)$/;

export default function PostBody({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (line.trim() === "") {
      i++;
      continue;
    }

    // Fenced code block
    if (line.trimStart().startsWith("```")) {
      const lang = line.trimStart().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing fence
      blocks.push(
        <pre
          key={`pre-${key++}`}
          className="my-5 overflow-x-auto rounded-[var(--radius-card)] border border-border bg-surface-2 p-4"
          data-lang={lang || undefined}
        >
          <code className="font-mono text-sm leading-relaxed">
            {codeLines.join("\n")}
          </code>
        </pre>
      );
      continue;
    }

    // Horizontal rule
    if (HR.test(line.trim())) {
      blocks.push(<hr key={`hr-${key++}`} className="my-8 border-border" />);
      i++;
      continue;
    }

    // Heading
    const heading = line.match(HEADING);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      const Tag = (["h1", "h2", "h3", "h4"] as const)[level - 1];
      blocks.push(
        <Tag key={`h-${key++}`}>{renderInline(text, `h-${key}`)}</Tag>
      );
      i++;
      continue;
    }

    // Callout: > [!note] Title  (followed by > body lines)
    const callout = line.match(CALLOUT);
    if (callout) {
      const kind = callout[1].toLowerCase();
      const title = callout[2];
      const bodyLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        bodyLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <div
          key={`callout-${key++}`}
          className="my-5 rounded-[var(--radius-card)] border-l-4 border-brand bg-surface p-4"
        >
          <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-brand-strong">
            {title || kind}
          </p>
          {bodyLines
            .filter((l) => l.trim() !== "")
            .map((l, idx) => (
              <p key={idx} className="text-sm">
                {renderInline(l, `callout-${key}-${idx}`)}
              </p>
            ))}
        </div>
      );
      continue;
    }

    // Plain blockquote
    if (line.trimStart().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith(">")) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`bq-${key++}`}
          className="my-5 border-l-4 border-border-strong pl-4 italic text-ink-subtle"
        >
          {renderInline(quoteLines.join(" "), `bq-${key}`)}
        </blockquote>
      );
      continue;
    }

    // Standalone image (its own paragraph)
    const imageOnly = line.trim().match(IMAGE_ONLY);
    if (imageOnly) {
      blocks.push(
        <img
          key={`img-${key++}`}
          src={imageOnly[2]}
          alt={imageOnly[1]}
          className="my-6 w-full rounded-[var(--radius-card)] border border-border"
          loading="lazy"
        />
      );
      i++;
      continue;
    }

    // Unordered list
    if (UL_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && UL_ITEM.test(lines[i])) {
        items.push(lines[i].match(UL_ITEM)![1]);
        i++;
      }
      blocks.push(
        <ul key={`ul-${key++}`}>
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ul-${key}-${idx}`)}</li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (OL_ITEM.test(line)) {
      const items: string[] = [];
      while (i < lines.length && OL_ITEM.test(lines[i])) {
        items.push(lines[i].match(OL_ITEM)![1]);
        i++;
      }
      blocks.push(
        <ol key={`ol-${key++}`} className="list-decimal pl-6">
          {items.map((item, idx) => (
            <li key={idx}>{renderInline(item, `ol-${key}-${idx}`)}</li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph: gather consecutive plain lines
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].trimStart().startsWith("```") &&
      !lines[i].trimStart().startsWith(">") &&
      !HEADING.test(lines[i]) &&
      !HR.test(lines[i].trim()) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i]) &&
      !lines[i].trim().match(IMAGE_ONLY)
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push(
        <p key={`p-${key++}`}>{renderInline(paraLines.join(" "), `p-${key}`)}</p>
      );
    }
  }

  return <div className="prose-body">{blocks}</div>;
}
