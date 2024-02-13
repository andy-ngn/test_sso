import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";
const Footer: React.FC = () => {
  const { t, ready } = useTranslation("common");
  if (!ready) return null;
  return (
    <footer>
      <p>{ready ? t("footer.about-us") : ""}</p>
    </footer>
  );
};

export default Footer;
