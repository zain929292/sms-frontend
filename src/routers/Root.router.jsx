import { Routes, Route } from "react-router-dom";
import AppRouter from "./App.router.jsx";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../redux/store/Store.redux.jsx";

/**
 * Wraps the app with Redux Provider, PersistGate,
 * and React Router's route configuration.
 *
 * @returns {JSX.Element} The root navigation and provider setup.
 */
const RootNavigator = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routes>
          <Route path="/*" element={<AppRouter />} />
        </Routes>
      </PersistGate>
    </Provider>
  );
};

export default RootNavigator;
