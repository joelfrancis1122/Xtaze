import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "sonner";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import Cursor from "./features/cursor";
import { AppRoutes } from "./routes";

const App = () => {
  return (
    <Router>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "rgba(255, 255, 255, 0.1)",
                color: "#fff",
                borderRadius: "12px",
                border: "0.1px solid rgba(255, 255, 255, 0.3)",
                padding: "16px",
                backdropFilter: "blur(10px)",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                transition: "all 0.3s ease-in-out",
              },
              className: "premium-toaster backdrop-blur-md",
            }}
          />
          <Cursor />
          <AppRoutes />
        </PersistGate>
      </Provider>
    </Router>
  );
};

export default App;
