import { Link } from "react-router-dom";
import { ServiceProvider, serviceCategories } from "@/data/services";
import { Star, MapPin, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProviderCardProps {
  provider: ServiceProvider;
}

const ProviderCard = ({ provider }: ProviderCardProps) => {
  const category = serviceCategories.find((c) => c.id === provider.categoryId);

  return (
    <div className="group overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={provider.coverPhoto}
          alt={provider.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {provider.verified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {category?.name}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">{provider.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="font-medium">{provider.rating}</span>
            <span className="text-muted-foreground">({provider.reviewCount})</span>
          </div>
        </div>

        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{provider.description}</p>

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {provider.location}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {provider.yearsExperience} years exp.
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">R{provider.hourlyRate}</span>
            <span className="text-sm text-muted-foreground">/hour</span>
          </div>
          <Link to={`/provider/${provider.id}`}>
            <Button size="sm">View Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderCard;
