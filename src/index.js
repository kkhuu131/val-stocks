import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import "@fontsource/comic-mono";
import { theme } from "@saas-ui/theme-glass";
import { HelmetProvider } from "react-helmet-async";

theme.fonts = {
  heading: `'Comic Mono', monospace`,
  body: `'Comic Mono', monospace`,
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme} resetCSS={true}>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
