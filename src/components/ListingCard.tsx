import { Link } from "react-router-dom";
import { serviceCategories } from "@/data/services";
import { MapPin, Clock, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRate } from "@/lib/rateUtils";

interface Listing {
  id: string;
  title: string;
  category_id: string;
  description: string | null;
  location: string | null;
  hourly_rate: number;
  years_experience: number | null;
  verified: boolean | null;
  cover_photo_url: string | null;
  rate_type?: string | null;
  rate_unit?: string | null;
  working_hours_per_day?: number | null;
}

interface ListingCardProps {
  listing: Listing;
}

const ListingCard = ({ listing }: ListingCardProps) => {
  const category = serviceCategories.find((c) => c.id === listing.category_id);
  const { amount, label, subtitle } = formatRate(
    listing.hourly_rate,
    listing.rate_type,
    listing.rate_unit,
    listing.working_hours_per_day
  );

  return (
    <div className="group overflow-hidden rounded-xl bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {listing.cover_photo_url ? (
          <img
            src={listing.cover_photo_url}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-4xl">{category?.icon || "🔧"}</span>
          </div>
        )}
        {listing.verified && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-card/90 px-2 py-1 text-xs font-medium text-primary backdrop-blur-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </div>
        )}
        <div className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {category?.icon} {category?.name}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <h3 className="font-display text-lg font-semibold text-foreground">{listing.title}</h3>
        </div>

        {listing.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {listing.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {listing.location}
            </span>
          )}
          {listing.years_experience && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {listing.years_experience} years exp.
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-foreground">{amount}</span>
            <span className="text-sm text-muted-foreground">{label}</span>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <Link to={`/listing/${listing.id}`}>
            <Button size="sm">View Profile</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
