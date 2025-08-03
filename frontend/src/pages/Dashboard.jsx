import { useEffect, useRef, useState } from "react";
import FinancialDashboard from "../components/FinanceDashboard";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from '../components/ui/resizable-navbar';

const navItems = [
  { name: "Overview", link: "#overview" },
  { name: "Learn Daily", link: "/daily-learn" },
  { name: "Smart OCR", link: "#ocr" },
  { name: "FinCalcy Tools", link: "#tools" },
];

export default function Dashboard() {
  const [showButton, setShowButton] = useState(true);
  const lastScrollY = useRef(0);
  const [userData, setUserData] = useState({})

  // getting the account data
  

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
        console.log("hey:",currentScrollY)
      if (currentScrollY <= 0) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <Navbar>
        <NavBody>
          <NavbarLogo show={showButton}/>
          <NavItems items={navItems} />
          {showButton && (
            <NavbarButton href="#chatbot" variant="gradient">
              💬 Ask FinBot Anything
            </NavbarButton>
          )}
        </NavBody>
      </Navbar>

      <main>
        <FinancialDashboard />
      </main>
    </div>
  );
}
