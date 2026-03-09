import { ContactForm } from "@/components/contact-form";

export default function ContactPage() {
  return (
    <div className="flex flex-col flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Let's build something together
        </h1>
        <p className="text-muted-foreground text-lg mb-8">
          Ready to take your digital experience to the next level? Drop me a message and let's talk about your next project.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
