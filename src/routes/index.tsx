import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import Navigation from "@/marketing/Navigation";
import HeroSection from "@/marketing/HeroSection";
import OfferSection from "@/marketing/OfferSection";
import ProblemSection from "@/marketing/ProblemSection";
import VisionSection from "@/marketing/VisionSection";
import FeaturesSection from "@/marketing/FeaturesSection";
import FAQSection from "@/marketing/FAQSection";
import FinalCallToAction from "@/marketing/FinalCallToAction";
import SiteFooter from "@/marketing/SiteFooter";

const TITLE = "Beez: The financial system never saw them. Beez does.";
const DESC = "Beez gives small businesses smart tools for real growth.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#fffdf7" },
    ],
  }),
  component: App,
});

type Page = "home" | "offer" | "vision" | "features" | "faq" | "problem";
const pages: Page[] = ["home", "offer", "vision", "features", "faq", "problem"];

function currentPage(): Page {
  const h = window.location.hash;
  const page = h.startsWith("#/") ? h.slice(2) : h.slice(1);
  if (page === "trust" || page === "built-on") {
    window.history.replaceState(null, "", "#/features");
    return "features";
  }
  return pages.includes(page as Page) ? (page as Page) : "home";
}

function App() {
  const [page, setPage] = useState<Page>("home");

  useEffect(() => {
    setPage(currentPage());
    const update = () => {
      setPage(currentPage());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);

  return (
    <div className="w">
      <Navigation />
      <main>
        {page === "home" && <HeroSection />}
        {page === "offer" && <OfferSection />}
        {page === "vision" && <VisionSection />}
        {page === "features" && <FeaturesSection />}
        {page === "faq" && <FAQSection />}
        {page === "problem" && (
          <>
            <FinalCallToAction />
            <ProblemSection />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
