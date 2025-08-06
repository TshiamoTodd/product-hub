import ProductManager from '@/components/ProductManager';

export default function Home() {
  return (
    <main className="min-h-screen container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="text-center my-8">
        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-bold text-primary">
          Product Hub
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A simple interface to manage your product listings.
        </p>
      </header>
      <ProductManager />
    </main>
  );
}
