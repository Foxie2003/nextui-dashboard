import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createTheme, NextUIProvider, useSSR } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { Layout } from "../components/layout/layout";
import { AuthProvider } from "../contexts/AuthContext";

const lightTheme = createTheme({
  type: "light",
  theme: {
    colors: {},
  },
});

const darkTheme = createTheme({
  type: "dark",
  theme: {
    colors: {},
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  const { isBrowser } = useSSR();

  // Chỉ render UI khi đang ở client-side để tránh lỗi hydration
  if (!isBrowser) {
    return null;
  }

  return (
    <NextThemesProvider
      defaultTheme="system"
      attribute="class"
      value={{
        light: lightTheme.className,
        dark: darkTheme.className,
      }}
    >
      <NextUIProvider>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </NextUIProvider>
    </NextThemesProvider>
  );
}

export default MyApp;
