import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  QueryClient,
  QueryClientProvider,
  Hydrate,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";
import { SessionProvider } from "next-auth/react";

import { RefreshTokenHandler } from "../components/refreshTokenHandler";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [interval, setInterval] = useState(0);
  console.log("interval", interval);
  return (
    <SessionProvider session={pageProps.session} refetchInterval={100}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={pageProps.dehydratedState}>
          <Component {...pageProps} />
          <RefreshTokenHandler setInterval={setInterval} />
          <ReactQueryDevtools initialIsOpen={false} />
        </Hydrate>
      </QueryClientProvider>
    </SessionProvider>
  );
}
