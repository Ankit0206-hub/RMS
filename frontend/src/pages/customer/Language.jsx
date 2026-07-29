import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageLayout from "../../components/customer/layout/PageLayout";
import Button from "../../components/customer/ui/Button";

export default function Language() {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const saved = localStorage.getItem("language");

    if (saved) {
      setLanguage(saved);
    }
  }, []);

  const languages = [
    "English",
    "Hindi",
    "Punjabi",
  ];

  const saveLanguage = () => {
    localStorage.setItem("language", language);
    navigate('/customer/settings');
  };

  return (
    <PageLayout className="bg-gray-50 dark:bg-slate-800/50">

      <div className="flex h-full flex-col">

        {/* Header */}

        <div className="bg-white dark:bg-slate-900 shadow-sm px-5 py-4 flex items-center">

          <button onClick={() => navigate('/customer/settings')}>
            <ArrowLeft size={22} />
          </button>

          <h1 className="flex-1 text-center text-lg font-semibold mr-6">
            Language
          </h1>

        </div>

        {/* Languages */}

        <div className="flex-1 p-5 space-y-4">

          {languages.map((item) => (

            <button
              key={item}
              onClick={() => setLanguage(item)}
              className={`w-full rounded-2xl border p-4 flex items-center justify-between transition ${
                language === item
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900"
              }`}
            >

              <span className="font-medium">
                {item}
              </span>

              {language === item ? (
                <CheckCircle2
                  className="text-orange-500"
                  size={22}
                />
              ) : (
                <Circle
                  className="text-gray-300"
                  size={22}
                />
              )}

            </button>

          ))}

        </div>

        {/* Bottom Button */}

        <div className="border-t bg-white dark:bg-slate-900 p-5">

          <Button onClick={saveLanguage}>
            Save
          </Button>

        </div>

      </div>

    </PageLayout>
  );
}