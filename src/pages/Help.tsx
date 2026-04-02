import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, MapPin, MessageSquare } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Help = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold text-foreground">Help & Support</h1>
        <p className="mt-2 text-muted-foreground">Get in touch or find answers to common questions.</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          {/* Contact Info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">Contact Us</h2>
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-5 w-5 text-primary" />
                <span>support@jobjet.co.za</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-5 w-5 text-primary" />
                <span>+27 (0) 12 345 6789</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Cape Town, South Africa</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                <span>Mon – Fri, 08:00 – 17:00 SAST</span>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-display text-xl font-semibold text-foreground">FAQs</h2>
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="faq-1">
                <AccordionTrigger>How do I book a service?</AccordionTrigger>
                <AccordionContent>
                  Browse available services, select a Pro, choose your preferred date and time, and send a booking request. The Pro will accept or decline your request.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-2">
                <AccordionTrigger>How do I become a Pro?</AccordionTrigger>
                <AccordionContent>
                  Sign up as a Pro, complete the vetting process, and once approved you can create listings and start receiving bookings.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-3">
                <AccordionTrigger>How do payments work?</AccordionTrigger>
                <AccordionContent>
                  Payment details and methods will be added soon. Stay tuned for updates.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq-4">
                <AccordionTrigger>Can I cancel a booking?</AccordionTrigger>
                <AccordionContent>
                  You can cancel a pending booking request. Once a booking is confirmed, please contact the Pro or our support team for assistance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Help;
