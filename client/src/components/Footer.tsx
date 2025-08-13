interface FooterProps {
  className?: string;
}

export default function Footer({ className = "" }: FooterProps) {
  return (
    <footer className={`footer-style shadow-sm ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center text-center space-y-4">
          <img src="/images/rtc.png" alt="RTC Logo" className="h-20 w-auto" />
          <div className="text-white">
            <h2 className="text-lg font-semibold">Tourism Office - Municipality of Rosario</h2>
          </div>
          <div className="text-white/90">
            <p className="text-sm">© 2025. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
