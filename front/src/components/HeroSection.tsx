const HeroSection = () => {
  return (
    <div className="bg-white py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4">

        <img
          src="/banner.jpg"
          alt="Uniformes FYTTSA"
          className="
            w-full 
            max-h-[300px] sm:max-h-[400px] lg:max-h-[450px] 
            object-cover 
            rounded-xl 
            mx-auto
          "
        />

      </div>
    </div>
  );
};

export default HeroSection;
