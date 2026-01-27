import brandmark from '../assets/brandmark.png';

export default function Header() {
  return (
    <header className="bg-white shadow-md py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-3">
          <img 
            src={brandmark} 
            alt="Roadmap Careers Icon" 
            className="h-10 w-10"
          />
          <span className="text-2xl md:text-3xl font-bold text-blue-600" style={{ fontFamily: "'Adineue PRO', sans-serif", fontWeight: 700 }}>
            roadmap careers<sup className="text-xs ml-0.5">©</sup>
          </span>
        </div>
      </div>
    </header>
  );
}
