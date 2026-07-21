import { ArrowLeft, Clock3, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileContainer from "../../components/customer/layout/MobileContainer";

const cover =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80";

const gallery = [
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
  "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80",
];

export default function About() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="flex h-full flex-col bg-white dark:bg-slate-900 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-slate-800">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-lg font-semibold">
            About Restaurant
          </h1>
        </div>

        {/* Cover */}
        <div className="px-5 pt-5">
          <img
            src={cover}
            alt="Restaurant"
            className="h-52 w-full rounded-2xl object-cover"
          />
        </div>

        {/* Restaurant Info */}
        <div className="px-5 pt-5">
          <h2 className="text-2xl font-bold">
            TastyBites Restaurant
          </h2>

          <p className="mt-1 text-orange-500 font-medium">
            Good Food, Good Mood
          </p>

          <p className="mt-4 text-sm leading-7 text-gray-500 dark:text-slate-400">
            We serve fresh vegetarian food prepared using premium
            ingredients and authentic recipes. Our mission is to deliver
            delicious meals with excellent hospitality in a warm and
            welcoming atmosphere.
          </p>
        </div>

        {/* Opening Hours */}
        <div className="mx-5 mt-7 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-start gap-3">
            <Clock3 className="text-orange-500 mt-1" size={20} />

            <div>
              <h3 className="font-semibold">
                Opening Hours
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Monday - Sunday
              </p>

              <p className="text-sm font-medium">
                10:00 AM - 11:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="mx-5 mt-4 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
          <div className="flex items-start gap-3">
            <MapPin className="text-orange-500 mt-1" size={20} />

            <div>
              <h3 className="font-semibold">
                Address
              </h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400 leading-6">
                123, Food Street,
                <br />
                Delicious City,
                <br />
                India - 400001
              </p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="px-5 py-6">
          <div className="grid grid-cols-3 gap-3">
            {gallery.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Restaurant ${index + 1}`}
                className="h-24 w-full rounded-xl object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </MobileContainer>
  );
}