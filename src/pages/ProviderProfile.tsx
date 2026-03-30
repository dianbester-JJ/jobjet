import { useParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { serviceProviders, serviceCategories } from "@/data/services";
import { Button } from "@/components/ui/button";
import { 
  Star, 
  MapPin, 
  Clock, 
  BadgeCheck, 
  Phone, 
  Mail, 
  ArrowLeft,
  Calendar,
  MessageSquare
} from "lucide-react";

const ProviderProfile = () => {
  const { id } = useParams();
  const provider = serviceProviders.find((p) => p.id === id);
  const category = provider ? serviceCategories.find((c) => c.id === provider.categoryId) : null;

  if (!provider) {
    return (
      <div className="min-h-screen bg-gradient-warm">
        <Header />
        <div className="container py-16 text-center">
          <h1 className="font-display text-3xl font-bold text-foreground">Pro Not Found</h1>
          <p className="mt-4 text-muted-foreground">The Pro you're looking for doesn't exist.</p>
          <Link to="/services">
            <Button className="mt-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Header />

      <main className="container py-8 md:py-12">
        {/* Breadcrumb */}
        <Link
          to="/services"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Services
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Photo */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <img
                src={provider.coverPhoto}
                alt={provider.name}
                className="h-full w-full object-cover"
              />
              {provider.verified && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
                  <BadgeCheck className="h-4 w-4" />
                  Verified Pro
                </div>
              )}
            </div>

            {/* Provider Info */}
            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
                      {category?.icon} {category?.name}
                    </span>
                  </div>
                  <h1 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
                    {provider.name}
                  </h1>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">{provider.rating}</span>
                  <span className="text-muted-foreground">({provider.reviewCount} reviews)</span>
                </div>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {provider.location}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {provider.yearsExperience} years experience
                </span>
              </div>

              <div className="mt-6">
                <h2 className="font-display text-xl font-semibold text-foreground">About</h2>
                <p className="mt-2 text-muted-foreground leading-relaxed">{provider.description}</p>
              </div>

              {/* Reviews Section */}
              <div className="mt-8">
                <h2 className="font-display text-xl font-semibold text-foreground">Reviews</h2>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((review) => (
                    <div key={review} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted" />
                          <div>
                            <p className="font-medium text-foreground">Happy Customer</p>
                            <p className="text-xs text-muted-foreground">2 weeks ago</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-4 w-4 fill-primary text-primary"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        Excellent work! Professional, on time, and the quality exceeded my expectations. 
                        Would highly recommend to anyone looking for this service.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">${provider.hourlyRate}</div>
                <p className="text-muted-foreground">per hour</p>
              </div>

              <div className="mt-6 space-y-3">
                <Button className="w-full" size="lg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>Contact via app</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Message provider</span>
                </div>
              </div>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Response time: Usually within 2 hours
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderProfile;
