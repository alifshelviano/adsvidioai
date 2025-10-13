// This is a new file
import { Header } from "@/components/layout/header";
import { ReviewGenerator } from "@/components/reviews/review-generator";

export default function ReviewsPage() {
  return (
    <>
      <Header pageTitle="Review Places" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-8">
            <p className="text-center text-muted-foreground">
                Enter a URL of a place (e.g., from a review site or map) to generate marketing assets.
            </p>
            <ReviewGenerator />
        </div>
      </main>
    </>
  );
}
