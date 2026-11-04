import { useEffect, useState } from "react";
import { LanguageContext } from "./LanguageContextBase";
import { translateText } from "./translations";

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved =
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem("psu-lang");
    return saved === "en" || saved === "id" ? saved : "id";
  });

  useEffect(() => {
    window.localStorage.setItem("psu-lang", lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev) => (prev === "id" ? "en" : "id"));
  };

  const t = (text) => translateText(text, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
