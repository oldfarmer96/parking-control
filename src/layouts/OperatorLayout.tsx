import { ModeToggle } from "@/presentation/components/theme/mode-toggle";
import { Outlet } from "react-router-dom";

const OperatorLayout = () => {
  return (
    <div>
      <header>
        <ModeToggle />
      </header>
      <Outlet />
    </div>
  );
};
export default OperatorLayout;
