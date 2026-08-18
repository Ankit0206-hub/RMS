import { ArrowLeft, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import BottomNav from "../../components/customer/navigation/BottomNav";
import { useApp } from "../../context/AppContext";

export default function Favorites() {
  const navigate = useNavigate();

  const { favorites, toggleFavorite } = useApp();

  return (
    <PageLayout className="bg-[#fafafa]">
      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="flex items-center gap-4 px-4 pt-5 pb-4 bg-white dark:bg-slate-900">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-xl font-semibold">
            My Favorites
          </h1>

        </div>

        {/* Favorites List */}

        <div className="flex-1 overflow-y-auto px-4 py-4">

          {favorites.length === 0 ? (

            <div className="flex h-full flex-col items-center justify-center">

              <Heart
                size={60}
                className="text-gray-300"
              />

              <h2 className="mt-4 text-lg font-semibold text-gray-700 dark:text-slate-300">
                No Favorites Yet
              </h2>

              <p className="mt-2 text-center text-sm text-gray-500 dark:text-slate-400">
                Tap the heart icon on any dish to add it here.
              </p>

            </div>

          ) : (

            favorites.map((food) => (

              <div
                key={food.id}
                onClick={() =>
                  navigate("/customer/food-details", {
                    state: { food },
                  })
                }
                className="mb-4 flex cursor-pointer items-center rounded-2xl bg-white dark:bg-slate-900 p-3 shadow-sm"
              >

                <img
                  src={food.image}
                  alt={food.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div className="ml-4 flex-1">

                  <h3 className="font-semibold">
                    {food.name}
                  </h3>

                  <p className="mt-2 font-semibold text-orange-500">
                    ₹{food.price}
                  </p>

                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(food);
                  }}
                >
                  <Heart
                    size={22}
                    className="fill-red-500 text-red-500"
                  />
                </button>

              </div>

            ))

          )}

        </div>

        <BottomNav active="favorites" />

      </div>
    </PageLayout>
  );
}