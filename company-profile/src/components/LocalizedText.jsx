import { useLanguage } from "../context/useLanguage";

export default function LocalizedText({ as: Tag = "span", children, ...props }) {
  const { t } = useLanguage();
  const text =
    typeof children === "string" ? children.trim().replace(/\s+/g, " ") : children;
  return <Tag {...props}>{t(text)}</Tag>;
}
