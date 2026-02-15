import Header from './Header';
import Footer from './Footer';
import katherinePhoto from '../assets/katherine.png';
import shirleyPhoto from '../assets/shirley.png';

export default function About() {
  const team = [
    {
      name: 'Katherine',
      role: 'Sr. Talent Manager',
      bio: 'Katherine is passionate about connecting talented individuals with the right opportunities. With extensive experience in talent acquisition and career development, she helps candidates navigate the job market and find roles where they can truly thrive.',
      initials: 'K',
      color: 'from-blue-500 to-blue-600',
      photo: katherinePhoto,
    },
    {
      name: 'Shirley',
      role: 'Talent Manager',
      bio: 'Shirley brings a people-first approach to talent management, ensuring every candidate receives personalized guidance and support. Her dedication to understanding each individual\'s strengths makes her an invaluable advocate in the hiring process.',
      initials: 'S',
      color: 'from-indigo-500 to-indigo-600',
      photo: shirleyPhoto,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About Roadmap Careers
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Helping you find the right path to a successful remote career.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Mission
          </h2>
          <div className="h-1 w-16 bg-blue-600 rounded mx-auto mb-8"></div>
          <p className="text-gray-600 text-lg leading-relaxed mb-6 text-center max-w-3xl mx-auto">
            At Roadmap Careers, we believe that everyone deserves access to meaningful
            work opportunities — regardless of location. Our mission is to bridge the gap
            between talented individuals and the remote roles that match their skills and
            ambitions.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed text-center max-w-3xl mx-auto">
            Through professional assessments, industry-recognized certifications, and
            personalized talent management, we equip candidates with the tools they need
            to stand out and succeed in the competitive remote job market.
          </p>
        </div>
      </div>

      {/* Meet the Team Section */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
          Meet the Team
        </h2>
        <div className="h-1 w-16 bg-blue-600 rounded mx-auto mb-4"></div>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Our talent managers are here to guide you every step of the way.
        </p>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {team.map((member) => (
            <div
              key={member.name}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform hover:scale-[1.02]"
            >
              <div className={`bg-gradient-to-r ${member.color} h-40 flex items-center justify-center`}>
                {member.photo ? (
                  <img
                    src={member.photo}
                    alt={member.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white/40 shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/40">
                    <span className="text-3xl font-bold text-white">{member.initials}</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Join the Team Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Join the Team
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            We're always looking for motivated individuals to join Roadmap Careers.
            If you're passionate about helping others succeed, we'd love to hear from you.
          </p>
          <a
            href="/careers"
            className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition-colors"
          >
            View Open Positions
          </a>
        </div>
      </div>

      <Footer />
    </div>
  );
}
