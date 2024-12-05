import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { ChakraUIProvider } from "./components/ui/provider.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ChakraUIProvider>
      <Provider store={store}>
        <App />
      </Provider>
    </ChakraUIProvider>
  </StrictMode>
);
