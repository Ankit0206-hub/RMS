import {
  ArrowLeft,
  ChevronRight,
  Clock3,
  Flame,
  Star,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useApp } from "../../../context/AppContext";
import PageLayout from "../../../customer_components/layout/PageLayout";

export default function FoodDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useApp();

  const food = location.state?.food;

  if (!food) {
    return (
      <PageLayout>
        <div className="flex h-full items-center justify-center bg-gray-100">
          <button
            onClick={() => navigate(-1)}
            className="rounded-xl bg-orange-500 px-6 py-3 font-medium text-white"
          >
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="relative flex h-full flex-col bg-white">
        {/* Hero Image */}
        <div className="relative h-[42%]">
          <img
            src={food.image}
            alt={food.name}
            className="h-full w-full object-cover"
          />

          <button
            onClick={() => navigate(-1)}
            className="absolute left-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Bottom Sheet */}
        <div className="-mt-6 flex-1 rounded-t-[30px] bg-white px-6 pt-6">
          {/* Title & Price */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {food.name}
              </h1>

              <div className="mt-2 flex items-center gap-2">
                <Star
                  size={15}
                  className="fill-yellow-400 text-yellow-400"
                />

                <span className="text-sm font-semibold">
                  {food.rating || "4.5"}
                </span>

                <span className="text-sm text-gray-500">
                  ({food.reviews || "308"})
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400 line-through">
                ₹{food.price + 60}
              </p>

              <p className="text-3xl font-bold text-orange-500">
                ₹{food.price}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-sm leading-6 text-gray-500">
            {food.description ||
              `Cottage cheese cooked in rich buttery tomato gravy using authentic spices and fresh ingredients.`}
          </p>

          {/* Chips */}
          <div className="mt-6 flex gap-3">
            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3">
              <Clock3
                size={18}
                className="text-orange-500"
              />

              <span className="text-sm font-semibold">
                20–25
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3">
              🌶️

              <span className="text-sm font-semibold">
                Medium
              </span>
            </div>

            <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 py-3">
              <Flame
                size={18}
                className="text-orange-500"
              />

              <span className="text-sm font-semibold">
                400
              </span>
            </div>
          </div>

          {/* Customize */}
          <button
            onClick={() => navigate("/customer/customization")}
            className="mt-7 flex w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4 transition hover:border-orange-400"
          >
            <span className="font-semibold text-gray-800">
              Customize
            </span>

            <ChevronRight
              size={20}
              className="text-gray-400"
            />
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="border-t border-gray-200 bg-white p-5">
          <button
            onClick={() => {
              addToCart(food);
              navigate("/customer/cart");
            }}
            className="h-14 w-full rounded-xl bg-orange-500 text-base font-semibold text-white shadow-lg transition hover:bg-orange-600"
          >
            Add to Cart &nbsp; ₹{food.price}
          </button>
        </div>
      </div>
    </PageLayout>
  );
}