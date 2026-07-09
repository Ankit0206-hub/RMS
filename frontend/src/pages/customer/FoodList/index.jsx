import { ArrowLeft, Plus, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import PageLayout from "../../../customer_components/layout/PageLayout";
import BottomNav from "../../../customer_components/navigation/BottomNav";
import { useApp } from "../../../context/AppContext";
const foodData = {
  veg: [
    { name: "Paneer Butter Masala", price: 239, image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800" },
    { name: "Veg Biryani", price: 199, image: "https://images.unsplash.com/photo-1701579231349-d7459c40919b?w=800" },
    { name: "Dal Makhani", price: 179, image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800" },
    { name: "Kadai Paneer", price: 229, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" },
    { name: "Palak Paneer", price: 219, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" },
    { name: "Mix Veg Curry", price: 189, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800" },
    { name: "Jeera Rice", price: 149, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800" },
    { name: "Veg Fried Rice", price: 179, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800" },
  ],
  "non-veg": [
    { name: "Butter Chicken", price: 349, image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800" },
    { name: "Chicken Biryani", price: 299, image: "https://images.unsplash.com/photo-1563379091339-03246963d29a?w=800" },
    { name: "Chicken Tikka", price: 279, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800" },
    { name: "Mutton Curry", price: 399, image: "https://images.unsplash.com/photo-1604908176997-431221d6b86b?w=800" },
    { name: "Fish Curry", price: 359, image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800" },
    { name: "Grilled Chicken", price: 329, image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800" },
    { name: "Chicken Fried Rice", price: 239, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800" },
    { name: "Prawn Masala", price: 429, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" },
  ],
  pizza: [
    { name: "Margherita", price: 249, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
    { name: "Farmhouse", price: 349, image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800" },
    { name: "Veg Supreme", price: 379, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
    { name: "Cheese Burst", price: 399, image: "https://images.unsplash.com/photo-1548365328-9f547fb0953b?w=800" },
    { name: "Pepperoni", price: 449, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
    { name: "Mexican Green Wave", price: 359, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=800" },
    { name: "Paneer Pizza", price: 329, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800" },
    { name: "BBQ Chicken Pizza", price: 449, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
  ],
  burger: [
    { name: "Veg Burger", price: 149, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    { name: "Chicken Burger", price: 189, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800" },
    { name: "Cheese Burger", price: 199, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    { name: "Paneer Burger", price: 179, image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800" },
    { name: "Double Patty Burger", price: 249, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800" },
    { name: "BBQ Burger", price: 219, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
    { name: "Mushroom Burger", price: 199, image: "https://images.unsplash.com/photo-1550317138-10000687a72b?w=800" },
    { name: "Crispy Chicken Burger", price: 229, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800" },
  ],
  chinese: [
    { name: "Hakka Noodles", price: 179, image: "https://images.unsplash.com/photo-1617622141675-d3005b9067c5?w=800" },
    { name: "Fried Rice", price: 189, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800" },
    { name: "Manchurian", price: 199, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800" },
    { name: "Spring Rolls", price: 169, image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800" },
    { name: "Chilli Paneer", price: 229, image: "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800" },
    { name: "Schezwan Noodles", price: 199, image: "https://images.unsplash.com/photo-1617622141675-d3005b9067c5?w=800" },
    { name: "Veg Momos", price: 159, image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800" },
    { name: "Chicken Momos", price: 189, image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800" },
  ],
  dessert: [
    { name: "Chocolate Cake", price: 149, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800" },
    { name: "Ice Cream", price: 99, image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800" },
    { name: "Brownie", price: 129, image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800" },
    { name: "Cheesecake", price: 199, image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800" },
    { name: "Gulab Jamun", price: 89, image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800" },
    { name: "Rasmalai", price: 119, image: "https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=800" },
    { name: "Donut", price: 99, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" },
    { name: "Cupcake", price: 89, image: "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800" },
  ],
  drinks: [
    { name: "Cold Coffee", price: 99, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800" },
    { name: "Mojito", price: 129, image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800" },
    { name: "Lemon Soda", price: 79, image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
    { name: "Oreo Shake", price: 149, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800" },
    { name: "Mango Shake", price: 139, image: "https://images.unsplash.com/photo-1553787499-6f913324e7d0?w=800" },
    { name: "Watermelon Juice", price: 109, image: "https://images.unsplash.com/photo-1553787499-6f913324e7d0?w=800" },
    { name: "Chocolate Shake", price: 159, image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800" },
    { name: "Fresh Lime", price: 69, image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800" },
  ],
  beverages: [
    { name: "Green Tea", price: 79, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
    { name: "Masala Tea", price: 49, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
    { name: "Black Coffee", price: 89, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
    { name: "Cappuccino", price: 149, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800" },
    { name: "Latte", price: 159, image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800" },
    { name: "Espresso", price: 129, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
    { name: "Hot Chocolate", price: 169, image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800" },
    { name: "Herbal Tea", price: 99, image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
  ],
};

export default function FoodList() {
  const navigate = useNavigate();
  const { category } = useParams();
  const { toggleFavorite, isFavorite } = useApp();

  const foods = (foodData[category] || []).map((food, index) => ({
    ...food,
    id: `${category}-${index}`,
  }));

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        {/* Header */}
        <div className="flex items-center gap-4 px-4 pt-5 pb-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-xl font-semibold capitalize">
            {category.replace("-", " ")}
          </h1>
        </div>

        {/* Food List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">

          {foods.map((food) => (
            <div
              key={food.name}
              onClick={() =>
                navigate("/food-details", {
                  state: {
                    food,
                  },
                })
              }
              className="mb-3 flex items-center rounded-2xl bg-white border border-gray-100 p-2 shadow-sm cursor-pointer transition active:scale-95"
            >
              <img
                src={food.image}
                alt={food.name}
                className="h-20 w-20 rounded-xl object-cover"
              />

              <div className="ml-3 flex-1">
                <h3 className="font-semibold text-gray-900">
                  {food.name}
                </h3>

                <p className="mt-1 font-semibold text-orange-500">
                  ₹{food.price}
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(food);
                  }}
                >
                  <Heart
                    size={22}
                    className={
                      isFavorite(food.id)
                        ? "fill-red-500 text-red-500"
                        : "text-gray-400"
                    }
                  />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    navigate("/food-details", {
                      state: {
                        food,
                      },
                    });
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white"
                >
                  <Plus size={18} />
                </button>

              </div>
            </div>
          ))}

          {foods.length === 0 && (
            <div className="mt-20 text-center text-gray-500">
              No items available.
            </div>
          )}

        </div>

        <BottomNav />

      </div>
    </PageLayout>
  );
}