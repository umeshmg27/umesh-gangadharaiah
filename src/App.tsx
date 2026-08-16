import BlogSection from "./components/BlogSection";
import CareerTimeline from "./components/CareerTimeline";
import ContactForm from "./components/ContactForm";
import ExpertiseSection from "./components/ExpertiseSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ImpactSummary from "./components/ImpactSummary";
import ProjectExplorer from "./components/ProjectExplorer";
import RecognitionGallery from "./components/RecognitionGallery";
import type { BlogSource } from "./blog/blogSource";
import "./styles/tokens.css";
import "./styles/global.css";

type AppProps = {
  readonly blogSource?: BlogSource | null;
};

export default function App({ blogSource }: AppProps = {}) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <ImpactSummary />
        <ExpertiseSection />
        <CareerTimeline />
        <ProjectExplorer />
        <BlogSection source={blogSource} />
        <RecognitionGallery />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
