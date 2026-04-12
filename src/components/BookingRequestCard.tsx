import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Clipboard } from "lucide-react";
import { format } from "date-fns";

interface BookingRequestCardProps {
  booking: {
    id: string;
    service_date: string;
    service_time: string;
    hours_requested: number;
    total_amount: number;
    status: string;
    address: string | null;
    notes: string | null;
    listing_title?: string;
  };
  isProvider: boolean;
  onAccept?: (bookingId: string) => void;
  onDecline?: (bookingId: string) => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Accepted", className: "bg-green-100 text-green-800" },
  cancelled: { label: "Declined", className: "bg-red-100 text-red-800" },
  completed: { label: "Completed", className: "bg-blue-100 text-blue-800" },
};

const BookingRequestCard = ({ booking, isProvider, onAccept, onDecline }: BookingRequestCardProps) => {
  const status = statusConfig[booking.status] || { label: booking.status, className: "bg-muted text-muted-foreground" };

  return (
    <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <ClipboardList className="h-3.5 w-3.5" />
          Booking Request
        </p>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      {booking.listing_title && (
        <p className="font-semibold text-foreground">{booking.listing_title}</p>
      )}

      <div className="space-y-1.5 text-sm">
        <p className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(booking.service_date), "PPP")}
        </p>
        <p className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          {booking.service_time} · {booking.hours_requested}h
        </p>
        {booking.address && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            {booking.address}
          </p>
        )}
      </div>

      {booking.notes && (
        <p className="text-sm italic text-muted-foreground">"{booking.notes}"</p>
      )}

      <p className="text-lg font-bold text-primary">R{booking.total_amount.toFixed(2)} est.</p>

      {isProvider && booking.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" className="flex-1" onClick={() => onAccept?.(booking.id)}>
            <CheckCircle className="mr-1.5 h-4 w-4" />
            Accept
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onDecline?.(booking.id)}>
            <XCircle className="mr-1.5 h-4 w-4" />
            Decline
          </Button>
        </div>
      )}
    </div>
  );
};

export default BookingRequestCard;
