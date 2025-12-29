import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex flex-col flex-1 w-full">
        <main className="p-4 pt-16 lg:pt-6 lg:p-6">
          <Outlet />   
        </main>
      </div>
    </div>
  );
}
