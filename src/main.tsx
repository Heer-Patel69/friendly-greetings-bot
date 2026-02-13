import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nProvider } from "./hooks/use-i18n.tsx";
import { ThemeProvider } from "./hooks/use-theme.tsx";
import { AuthProvider } from "./hooks/use-auth.tsx";
import { initDB, startSyncService } from "./lib/offline-db.ts";

// Initialize IndexedDB and start background sync
initDB().then(() => {
  console.log("[DukaanOS] Offline database ready");
  startSyncService();
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <I18nProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </I18nProvider>
  </ThemeProvider>
);
