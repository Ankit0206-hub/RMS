import { useNavigate } from "react-router-dom";

const defaultImages = [
  "https://images.unsplash.com/photo-1628294895950-9805252327bc?w=200&q=80",
  "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=200&q=80",
  "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=200&q=80",
  "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80"
];

export default function Categories({ categories = [] }) {
  const navigate = useNavigate();
  
  const allCategory = {
    title: "All",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80",
    isAll: true,
  };

  const dynamicCategories = categories.map((cat, idx) => ({
    title: cat.name,
    image: defaultImages[idx % defaultImages.length],
    isAll: false,
  }));

  const displayCategories = [allCategory, ...dynamicCategories];

  return (
    <section className="mt-8">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {displayCategories.map((item) => (
          <div
            key={item.title}
            onClick={() => 
              navigate(item.isAll 
                ? "/customer/categories" 
                : `/customer/food-list/${item.title.toLowerCase().replace(/\s+/g, "-")}`
              )
            }
            className="flex flex-col items-center gap-2 cursor-pointer min-w-[70px]"
          >
            <div className={`rounded-full p-[2px] ${item.isAll ? "bg-orange-500" : "bg-transparent"}`}>
              <img
                src={item.image}
                alt={item.title}
                className="h-16 w-16 rounded-full object-cover shadow-sm border-2 border-white"
              />
            </div>
            <span className={`text-xs font-medium text-center leading-tight ${item.isAll ? "text-orange-500" : "text-gray-600"}`}>
              {item.title}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}