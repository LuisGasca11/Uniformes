import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Uniformes from "@/pages/Uniformes";

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <Uniformes />
      <Footer />
    </>
  );
}
