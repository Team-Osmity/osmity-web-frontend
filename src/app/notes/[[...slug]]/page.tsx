import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";

import styles from "../notes.module.css";

type PageProps = {
  params: Promise<{ slug?: string[] }>;
};

type DirectoryEntry = {
  name: string;
  href: string;
  type: "file" | "directory";
};

const CONTENT_ROOT = path.join(process.cwd(), "content", "markdown");

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");

const renderInlineMarkdown = (value: string) => {
  let rendered = escapeHtml(value);
  rendered = rendered.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  rendered = rendered.replace(/\*(.+?)\*/g, "<em>$1</em>");
  rendered = rendered.replace(/`(.+?)`/g, "<code>$1</code>");
  rendered = rendered.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  return rendered;
};

const renderMarkdown = (markdown: string) => {
  const lines = markdown.split("\n");
  const blocks: string[] = [];
  let inCode = false;
  let codeBuffer: string[] = [];
  let listBuffer: string[] = [];
  let orderedBuffer: string[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length > 0) {
      blocks.push(`<p>${renderInlineMarkdown(paragraphBuffer.join(" "))}</p>`);
      paragraphBuffer = [];
    }
  };

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push(`<ul>${listBuffer.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ul>`);
      listBuffer = [];
    }
    if (orderedBuffer.length > 0) {
      blocks.push(`<ol>${orderedBuffer.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join("")}</ol>`);
      orderedBuffer = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) {
        blocks.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
        codeBuffer = [];
        inCode = false;
      } else {
        flushParagraph();
        flushList();
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeBuffer.push(line);
      continue;
    }

    if (line.trim().length === 0) {
      flushParagraph();
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      blocks.push(`<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`);
      continue;
    }

    const blockquoteMatch = line.match(/^>\s+(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${renderInlineMarkdown(blockquoteMatch[1])}</blockquote>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      flushParagraph();
      orderedBuffer = [];
      listBuffer.push(listMatch[1]);
      continue;
    }

    const orderedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (orderedMatch) {
      flushParagraph();
      listBuffer = [];
      orderedBuffer.push(orderedMatch[2]);
      continue;
    }

    paragraphBuffer.push(line.trim());
  }

  flushParagraph();
  flushList();

  if (inCode) {
    blocks.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
  }

  return blocks.join("\n");
};

const buildBreadcrumbs = (segments: string[]) => {
  const crumbs = [{ name: "トップ", href: "/notes" }];
  let currentPath = "";
  for (const segment of segments) {
    currentPath += `/${segment}`;
    crumbs.push({ name: segment, href: `/notes${currentPath}` });
  }
  return crumbs;
};

const toDisplayName = (name: string) => name.replace(/\.md$/, "");

const toHref = (segments: string[]) => `/notes/${segments.join("/")}`;

const getDirectoryEntries = async (segments: string[]) => {
  const dirPath = path.join(CONTENT_ROOT, ...segments);
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  const mapped: DirectoryEntry[] = entries
    .filter((entry) => !entry.name.startsWith("."))
    .map((entry) => {
      if (entry.isDirectory()) {
        return {
          name: entry.name,
          href: toHref([...segments, entry.name]),
          type: "directory" as const,
        };
      }

      if (entry.isFile() && entry.name.endsWith(".md")) {
        return {
          name: toDisplayName(entry.name),
          href: toHref([...segments, entry.name.replace(/\.md$/, "")]),
          type: "file" as const,
        };
      }

      return null;
    })
    .filter((entry): entry is DirectoryEntry => Boolean(entry));

  mapped.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? -1 : 1;
    }
    return a.name.localeCompare(b.name, "ja");
  });

  return mapped;
};

const readMarkdownFile = async (segments: string[]) => {
  const filePath = path.join(CONTENT_ROOT, ...segments);
  const contents = await fs.readFile(filePath, "utf8");
  return renderMarkdown(contents);
};

const resolvePath = async (segments: string[]) => {
  const normalized = path.normalize(path.join(CONTENT_ROOT, ...segments));
  if (!normalized.startsWith(CONTENT_ROOT)) {
    return null;
  }

  const withMd = `${normalized}.md`;

  try {
    const stat = await fs.stat(normalized);
    if (stat.isDirectory()) {
      return { type: "directory" as const, fsPath: normalized, segments };
    }
  } catch {
    // ignore
  }

  try {
    const stat = await fs.stat(withMd);
    if (stat.isFile()) {
      return { type: "file" as const, fsPath: withMd, segments: [...segments.slice(0, -1), `${segments.at(-1) ?? ""}.md`] };
    }
  } catch {
    // ignore
  }

  return null;
};

export default async function NotesPage({ params }: PageProps) {
  const { slug } = await params;
  const segments = slug ?? [];
  const resolved = await resolvePath(segments);

  if (!resolved) {
    notFound();
  }

  const breadcrumbs = buildBreadcrumbs(segments);
  const directorySegments = resolved.type === "file" ? segments.slice(0, -1) : segments;
  const entries = await getDirectoryEntries(directorySegments);

  const indexFileExists = await fs
    .stat(path.join(CONTENT_ROOT, ...directorySegments, "README.md"))
    .then((stat) => stat.isFile())
    .catch(() => false);

  const directoryIntro = indexFileExists
    ? await readMarkdownFile([...directorySegments, "README.md"])
    : null;

  let contentHtml = "";
  let isDirectory = false;

  if (resolved.type === "file") {
    contentHtml = await readMarkdownFile(resolved.segments);
  } else {
    isDirectory = true;
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <h2>Navigation</h2>
        <ul className={styles.navList}>
          {entries.map((entry) => (
            <li key={entry.href} className={styles.navItem}>
              <Link href={entry.href}>
                {entry.type === "directory" ? "📁" : "📝"} {entry.name}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className={styles.content}>
        <div className={styles.breadcrumbs}>
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href}>
              <Link href={crumb.href}>{crumb.name}</Link>
              {index < breadcrumbs.length - 1 ? " / " : ""}
            </span>
          ))}
        </div>
        {directoryIntro && (
          <div
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: directoryIntro }}
          />
        )}
        {isDirectory ? (
          <ul className={styles.directoryList}>
            {entries.map((entry) => (
              <li key={entry.href}>
                <Link href={entry.href}>
                  {entry.type === "directory" ? "📁" : "📝"} {entry.name}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className={styles.markdown}
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        )}
      </main>
    </div>
  );
}
