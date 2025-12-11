import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const host = h.get("host") ?? "";

  // ========== 環境変数の取得 ==========
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;

  // 状態判定
  const isDev = appEnv === "dev";
  const isProd = appEnv === "prod";
  const isMissing = appEnv === undefined;

  // ========== メッセージ（既存ロジック） ==========
  let message = "Hello from Local!";
  if (host.includes("osmity")) {
    message = "Hello Osmity!";
  } else if (host.includes("shizuku86")) {
    message = "Hello Shizuku!";
  }

  return (
    <main style={{ padding: 24 }}>
      {/* ====== dev 環境バナー ====== */}
      {isDev && (
        <div style={{
          background: "red",
          color: "white",
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "4px",
        }}>
          現在は開発環境（DEV）です
        </div>
      )}

      {/* ====== 読み込まれていない場合 ====== */}
      {isMissing && (
        <div style={{
          background: "orange",
          color: "black",
          padding: "8px",
          marginBottom: "16px",
          borderRadius: "4px",
        }}>
          NEXT_PUBLIC_APP_ENV が読み込まれていません！
        </div>
      )}

      <h1>Hello World!!!</h1>
      <h1>{message}</h1>

      <p>Host: {host}</p>
      <p>Environment: {appEnv ?? "undefined"}</p>
    </main>
  );
}
