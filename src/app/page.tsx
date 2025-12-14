export const dynamic = "force-dynamic";
// export const revalidate = 0;  // こちらでも可

import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const host = h.get("host") ?? "";

  let message = "Hello from Local!";
  if (host.includes("osmity")) {
    message = "Hello Osmity!";
  } else if (host.includes("shizuku86")) {
    message = "Hello Shizuku!";
  }

  return (
    <main>
      <h1>Hello World!!!</h1>
      <h1>{message}</h1>

      <p>Host: {host}</p>
      <p>ページを更新しました！！！</p>
    </main>
  );
}
