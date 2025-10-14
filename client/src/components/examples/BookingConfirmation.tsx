import BookingConfirmation from "../BookingConfirmation";

export default function BookingConfirmationExample() {
  return (
    <div className="p-6">
      <BookingConfirmation
        date={new Date(2025, 9, 20)}
        time="2:00 PM"
        staffName="Sarah Johnson"
        customerName="John Doe"
        customerPhone="+1234567890"
        customerEmail="john@example.com"
        smsNotificationSent={true}
        emailNotificationSent={true}
        onNewBooking={() => console.log("New booking clicked")}
      />
    </div>
  );
}
