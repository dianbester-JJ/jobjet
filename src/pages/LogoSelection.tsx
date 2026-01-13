import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowLeft } from "lucide-react";
import logoOption1 from "@/assets/logo-option-1.png";
import logoOption2 from "@/assets/logo-option-2.png";
import logoOption3 from "@/assets/logo-option-3.png";
import logoOption4 from "@/assets/logo-option-4.png";
import logoOption5 from "@/assets/logo-option-5.png";
import logoOption6 from "@/assets/logo-option-6.png";
import logoOption7 from "@/assets/logo-option-7.png";

const logoOptions = [
  {
    id: 1,
    name: "Shield & Check",
    description: "T with checkmark and gold accent - trust & reliability",
    image: logoOption1,
    style: "Classic",
  },
  {
    id: 2,
    name: "Home & T",
    description: "House roof with T letter - home services focus",
    image: logoOption2,
    style: "Classic",
  },
  {
    id: 3,
    name: "Dynamic Arrows",
    description: "Four-way arrows with gradient - service everywhere",
    image: logoOption3,
    style: "Classic",
  },
  {
    id: 4,
    name: "Hammer T",
    description: "Minimalist T shaped like a hammer - DIY & tools",
    image: logoOption4,
    style: "Minimalist",
  },
  {
    id: 5,
    name: "Home Security",
    description: "Navy & orange house with keyhole - trust & home",
    image: logoOption5,
    style: "Colorful",
  },
  {
    id: 6,
    name: "Crossed Tools",
    description: "Paintbrush & wrench crossed - multi-service DIY",
    image: logoOption6,
    style: "Minimalist",
  },
  {
    id: 7,
    name: "Bold T Tag",
    description: "Black & yellow modern T with price tag - bold & modern",
    image: logoOption7,
    style: "Bold",
  },
];

const LogoSelection = () => {
  const [selectedLogo, setSelectedLogo] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-warm">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container py-12">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              Choose Your Logo
            </h1>
            <p className="mt-3 text-muted-foreground">
              Select the logo that best represents Taska
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {logoOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedLogo(option.id)}
                className={`group relative overflow-hidden rounded-2xl border-2 bg-card p-6 text-left transition-all duration-300 hover:shadow-card-hover ${
                  selectedLogo === option.id
                    ? "border-primary shadow-card-hover"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {selectedLogo === option.id && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                
                <span className="absolute left-3 top-3 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {option.style}
                </span>
                
                <div className="mt-4 flex aspect-square items-center justify-center rounded-xl bg-background p-4">
                  <img
                    src={option.image}
                    alt={option.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                
                <div className="mt-4">
                  <h3 className="font-semibold text-foreground">{option.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                </div>
              </button>
            ))}
          </div>

          {selectedLogo && (
            <div className="mt-12 text-center">
              <p className="mb-4 text-muted-foreground">
                You selected <strong>Option {selectedLogo}</strong>
              </p>
              <Button size="lg">
                Apply This Logo
              </Button>
            </div>
          )}

          {/* Preview with selected logo */}
          {selectedLogo && (
            <div className="mt-16">
              <h2 className="mb-6 text-center font-display text-xl font-semibold text-foreground">
                Preview in Header
              </h2>
              <div className="rounded-xl border border-border bg-background/80 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-lg">
                    <img
                      src={logoOptions[selectedLogo - 1].image}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <span className="font-sans text-xl font-semibold tracking-tight text-foreground">
                    Taska
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LogoSelection;
