export default function Footer({ minimal = false }) {
  const currentYear = new Date().getFullYear();

  // Minimal footer for assessment pages - just copyright
  if (minimal) {
    return (
      <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-600">
          <p>© {currentYear} Roadmap Careers. All rights reserved.</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8 mb-6">
          {/* Company Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Roadmap Careers ©</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/certification" className="hover:text-blue-600 transition-colors">
                  Get Certified
                </a>
              </li>
              <li>
                <a href="/certificate?id=RC-L5X8K9PQ-A7B3C9" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                  Sample Certificate
                </a>
              </li>
              <li>
                <a href="/verify-certificate" className="hover:text-blue-600 transition-colors">
                  Verify Certificate
                </a>
              </li>
              <li>
                <a href="/certification-prep" className="hover:text-blue-600 transition-colors">
                  Study Guide
                </a>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">For Employers</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="/verify-certificate" className="hover:text-blue-600 transition-colors">
                  Verify Candidate Certificates
                </a>
              </li>
              <li>
                <span className="text-gray-500">Bulk Verification (Coming Soon)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
          <p>© {currentYear} Roadmap Careers. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
