import { Link } from "react-router-dom";
import { ServiceCategory } from "@/data/services";

interface ServiceCategoryCardProps {
  category: ServiceCategory;
}

const ServiceCategoryCard = ({ category }: ServiceCategoryCardProps) => {
  return (
    <Link
      to={`/services?category=${category.id}`}
      className="group relative overflow-hidden rounded-xl shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={category.image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{category.icon}</span>
          <h3 className="font-display text-lg font-semibold text-primary-foreground">
            {category.name}
          </h3>
        </div>
        <p className="mt-1 text-sm text-primary-foreground/80">{category.description}</p>
      </div>
    </Link>
  );
};

export default ServiceCategoryCard;
