import HeroSection from "../components/HeroSection";
import Breadcrumb from "../components/Breadcrumb";
import CategoryMenu from "../components/CategoryMenu";
import CategoriesGrid from "@/components/CategoryGrid";

const Uniformes = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <Breadcrumb />
      <CategoryMenu />
      <CategoriesGrid />
    </div>
  );
};

export default Uniformes;