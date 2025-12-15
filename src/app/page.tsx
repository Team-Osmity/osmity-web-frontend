export const dynamic = "force-dynamic";

import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const host = h.get("host") ?? "";

  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "unknown";
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown";
  const commit = process.env.NEXT_PUBLIC_COMMIT_SHA ?? "";

  let message = "Hello from Local!";
  if (host.includes("osmity")) {
    message = "Hello Osmity!";
  } else if (host.includes("shizuku86")) {
    message = "Hello Shizuku!";
  }

  return (
    <main style={{ padding: 24, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Main content */}
      <div style={{ flex: 1 }}>
        <h1>Hello World!!!</h1>
        <h1>{message}</h1>

        <hr />

        <p><strong>Host:</strong> {host}</p>
        <p><strong>APP_ENV:</strong> {appEnv}</p>

        {appEnv === "dev" && commit && (
          <p style={{ color: "#c0392b", fontWeight: "bold" }}>
            commit: {commit}
          </p>
        )}

        <p>ページを更新しました！！！</p>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 32,
          paddingTop: 12,
          borderTop: "1px solid #ddd",
          fontSize: 12,
          color: "#666",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>Osmity Web</span>
        <span>
          version {appVersion}
          {appEnv === "dev" && commit && ` (${commit})`}
        </span>
      </footer>
    </main>
  );
}
