import { BsArrowRight } from "react-icons/bs";

export const Card = ({ title, description }) => {
  return (
    <div className="max-w-sm w-full border-white border-[1px] rounded-lg shadow-lg overflow-hidden transition-all duration-500 ease-in-out group">
      <div className="relative p-6  transition-all duration-500 ease-in-out">
        <div className="flex items-center justify-between mb-4">
          <h2 className=" font-bold text-white">
            {title}
          </h2>
         
          <BsArrowRight
            className="text-white transition-transform duration-500 ease-in-out -translate-x-8 transform group-hover:translate-x-3"
          />
        </div>
        <p className="text-white group-hover:text-gray-200 transition-all duration-500 ease-in-out">
          {description}
        </p>
        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-in-out"></div>
      </div>
    </div>
  );
};
