import Contact from "./components/Contact";
import Expertise from "./components/Expertise";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import ImpactSummary from "./components/ImpactSummary";
import Project from "./components/Project";
import Recognition from "./components/Recognition";
import Timeline from "./components/Timeline";
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
        <Expertise />
        <Timeline />
        <Project />
        <Recognition />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
