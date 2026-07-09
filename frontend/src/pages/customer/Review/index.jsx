import { useState } from "react";
import { ArrowLeft, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../../customer_components/layout/PageLayout";
import Button from "../../../customer_components/ui/Button";

export default function Review() {
  const navigate = useNavigate();

  const [food, setFood] = useState(0);
  const [service, setService] = useState(0);
  const [ambience, setAmbience] = useState(0);

  const [comment, setComment] = useState("");

  const Rating = ({ value, onChange }) => (
    <div className="flex gap-2 mt-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
        >
          <Star
            size={28}
            className={
              star <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        </button>
      ))}
    </div>
  );

  return (
    <PageLayout className="bg-gray-50">

      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="flex items-center bg-white px-5 py-4 shadow-sm">

          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Review & Rating
          </h1>

        </div>

        {/* Content */}

        <div className="flex-1 overflow-y-auto p-5 space-y-6">

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h2 className="text-xl font-semibold">
              How was your experience?
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Your feedback helps us improve.
            </p>

          </div>

          {/* Food */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h3 className="font-semibold">
              Food Quality
            </h3>

            <Rating
              value={food}
              onChange={setFood}
            />

          </div>

          {/* Service */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h3 className="font-semibold">
              Service
            </h3>

            <Rating
              value={service}
              onChange={setService}
            />

          </div>

          {/* Ambience */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h3 className="font-semibold">
              Ambience
            </h3>

            <Rating
              value={ambience}
              onChange={setAmbience}
            />

          </div>

          {/* Comments */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <h3 className="font-semibold mb-3">
              Your Comments
            </h3>

            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Great food and service!"
              className="w-full rounded-xl border border-gray-200 p-3 outline-none focus:border-orange-500 resize-none"
            />

          </div>

        </div>

        {/* Submit */}

        <div className="border-t bg-white p-5">

          <Button
            onClick={() => navigate("/customer/Profile")}
          >
            Submit Review
          </Button>

        </div>

      </div>

    </PageLayout>
  );
}