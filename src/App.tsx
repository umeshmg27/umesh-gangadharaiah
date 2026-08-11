import CareerTimeline from "./components/CareerTimeline";
import ContactForm from "./components/ContactForm";
import ExpertiseSection from "./components/ExpertiseSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ImpactSummary from "./components/ImpactSummary";
import ProjectExplorer from "./components/ProjectExplorer";
import RecognitionGallery from "./components/RecognitionGallery";
import "./styles/tokens.css";
import "./styles/global.css";

export default function App() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <ImpactSummary />
        <ExpertiseSection />
        <CareerTimeline />
        <ProjectExplorer />
        <RecognitionGallery />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
