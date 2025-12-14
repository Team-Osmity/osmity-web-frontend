export const dynamic = "force-dynamic";
// export const revalidate = 0;  // こちらでも可

import { headers } from "next/headers";

export default async function Home() {
  const h = await headers();
  const host = h.get("host") ?? "";

  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;

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
      <p>Environment: {appEnv ?? "undefined"}</p>
    </main>
  );
}
