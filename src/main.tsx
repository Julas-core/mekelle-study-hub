import React from "react"; // Import React library (JSX transform may rely on this import)
import { createRoot } from "react-dom/client"; // Import createRoot function from react-dom for React 18+ rendering
import App from "./App"; // Import the root App component from the local App module
import "./index.css"; // Import global CSS so bundler includes it in the build

const rootEl = document.getElementById("root"); // Find the DOM element with id "root" where the app will mount
if (!rootEl) throw new Error("Root element not found"); // If that element is missing, throw an error to fail fast
const root = createRoot(rootEl); // Create a React root using the found DOM element (enables concurrent features)
root.render(<App />); // Render the <App /> component tree into the created React root
