import ProductScanner from '@/components/scanwise/ProductScanner';
// import { PackageSearch } from 'lucide-react'; // Icon replaced with custom SVG

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      <div className="flex-grow w-full p-4 md:p-8 flex flex-col items-center">
        <header className="my-8 md:my-12 text-center">
          <div className="flex items-center justify-center mb-2">
            {/* Using a simple SVG logo - can remain generic or be updated later if a specific LIBRTOD logo is available */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-primary"
            >
              <path
                d="M15.5 7.5C15.5 5.84315 14.1569 4.5 12.5 4.5C10.8431 4.5 9.5 5.84315 9.5 7.5C9.5 9.15685 10.8431 10.5 12.5 10.5C14.1569 10.5 15.5 9.15685 15.5 7.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M5 12.5C5 10.1547 6.50391 8.16815 8.53405 7.69391M19 12.5C19 10.1547 17.4961 8.16815 15.4659 7.69391"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M21 12.5V13.5C21 16.5267 18.5267 19 15.5 19H8.5C5.47327 19 3 16.5267 3 13.5V12.5C3 9.80363 4.64041 7.50146 6.99951 6.80365L7.45833 6.67708"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10.5 14.5H13.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <h1 className="text-4xl md:text-5xl font-bold ml-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              LIBRTOD
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Instantly identify products and get detailed AI descriptions.
          </p>
        </header>
        <main className="w-full max-w-5xl"> {/* Increased max-width slightly */}
          <ProductScanner />
        </main>
      </div>
      <footer className="w-full py-6 text-center text-sm text-muted-foreground border-t">
        <p>&copy; {new Date().getFullYear()} LIBRTOD. Crafted with AI.</p>
      </footer>
    </div>
  );
}
