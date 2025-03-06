import ContactForm from "@/app/components/ContactForm"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact</h1>
      <div className="max-w-md mx-auto">
        <ContactForm />
      </div>
    </div>
  );
}
