import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./presentation/components/theme/theme-provider";
import { router } from "./routes/routes";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./config/tanstack-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="parking-control-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
        <Toaster closeButton richColors position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  );
};
export default App;
