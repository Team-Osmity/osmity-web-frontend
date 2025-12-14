export const dynamic = "force-dynamic";
// export const revalidate = 0;

import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const host =  h.get("host") ?? "";

  const appEnv = process.env.NEXT_PUBLIC_APP_ENV ?? "unknown";

  let message = "Hello from Local!";
  if (host.includes("osmity")) {
    message = "Hello Osmity!";
  } else if (host.includes("shizuku86")) {
    message = "Hello Shizuku!";
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Hello World!!!</h1>
      <h1>{message}</h1>

      <hr />

      <p>
        <strong>Host:</strong> {host}
      </p>

      <p>
        <strong>APP_ENV:</strong>{" "}
        <span
          style={{
            padding: "2px 6px",
            borderRadius: 4,
            background: appEnv === "prod" ? "#ddd" : "#c0392b",
            color: appEnv === "prod" ? "#333" : "#fff",
            fontWeight: "bold",
          }}
        >
          {appEnv}
        </span>
      </p>

      {appEnv !== "prod" && (
        <p style={{ color: "#c0392b", fontWeight: "bold" }}>
          ⚠ This is NOT production environment
        </p>
      )}

      <p>ページを更新しました！！！</p>
    </main>
  );
}
