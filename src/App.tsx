import Contact from "./components/Contact";
import CareerTimeline from "./components/CareerTimeline";
import ExpertiseSection from "./components/ExpertiseSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ImpactSummary from "./components/ImpactSummary";
import Project from "./components/Project";
import Recognition from "./components/Recognition";
import "./index.scss";
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
        <Project />
        <Recognition />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
