import { Footer } from "../components/Footer";
import { Header } from "../components/Header";

export const PageLayout = ({ children, isDetailPage = false }) => {
  return /* html */ `
    <div class="min-h-screen bg-gray-50">
        ${Header({ isDetailPage })}
        <main class="max-w-md mx-auto px-4 py-4">
            ${children}
        </main>
        ${Footer()}
    </div>
    `;
};
