import { useRef, useState } from 'react';
import html2pdf from 'html2pdf.js';

// Import the certificate template image for sample view
import certificateTemplate from '../assets/certificate-template.png';

export default function Certificate({ userInfo, examResult, certificateId, onDownload, isSample = false }) {
  const certificateRef = useRef(null);
  const [isPdfMode, setIsPdfMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/certificate?id=${certificateId}`
    : '';

  // Generate a formatted date
  const completionDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;

    try {
      setIsPdfMode(true);
      await new Promise(resolve => requestAnimationFrame(() => setTimeout(resolve, 0)));
      const element = certificateRef.current;
      
      const options = {
        margin: 0,
        filename: `RoadmapCareers_Certificate_${certificateId}.pdf`,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { 
          scale: 3,
          useCORS: true,
          letterRendering: true,
          backgroundColor: '#ffffff',
          width: 1122,
          height: 794,
          windowWidth: 1122,
          windowHeight: 794
        },
        jsPDF: { 
          unit: 'px', 
          format: [1122, 794], 
          orientation: 'landscape',
          hotfixes: ['px_scaling']
        }
      };

      await html2pdf().from(element).set(options).save();
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsPdfMode(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  // SAMPLE CERTIFICATE - just show the image
  if (isSample) {
    return (
      <div className="max-w-5xl mx-auto">
        <div 
          className="shadow-2xl relative mx-auto"
          style={{
            width: '1122px',
            height: '794px',
            overflow: 'hidden'
          }}
        >
          <img 
            src={certificateTemplate}
            alt="Sample Certificate"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              userSelect: 'none'
            }}
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
        <p className="text-center text-gray-500 mt-4 text-sm">
          This is a sample certificate. Pass the exam to receive your personalized certificate.
        </p>
      </div>
    );
  }

  // REAL CERTIFICATE - full HTML with user data
  return (
    <div className="max-w-5xl mx-auto">
      {/* Certificate Display */}
      <div 
        ref={certificateRef}
        className="bg-white shadow-2xl relative mx-auto"
        style={{
          width: '1122px',
          height: '794px',
          border: '20px solid #8B4513',
          borderImage: 'linear-gradient(45deg, #8B4513, #D4A574, #8B4513) 1',
          overflow: 'hidden'
        }}
      >
        {/* Decorative Corner Ornaments */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="text-amber-700">
            <path d="M0,0 L50,50 L0,100 Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 transform rotate-90">
          <svg viewBox="0 0 100 100" className="text-amber-700">
            <path d="M0,0 L50,50 L0,100 Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10 transform -rotate-90">
          <svg viewBox="0 0 100 100" className="text-amber-700">
            <path d="M0,0 L50,50 L0,100 Z" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 opacity-10 transform rotate-180">
          <svg viewBox="0 0 100 100" className="text-amber-700">
            <path d="M0,0 L50,50 L0,100 Z" fill="currentColor"/>
          </svg>
        </div>

        {/* Decorative Border Pattern */}
        <div className="absolute inset-4 border-4 border-double border-amber-700 opacity-30"></div>
        <div className="absolute inset-7 border border-amber-600 opacity-20"></div>

        {/* Main Content */}
        <div style={{ 
          position: 'relative', 
          height: '100%', 
          padding: '45px 50px 30px 50px',
          display: 'block'
        }}>
          {/* Header */}
          <div className="text-center" style={{ flexShrink: 0, marginBottom: '28px' }}>
            <div style={{ marginBottom: '8px' }}>
              {isPdfMode ? (
                <svg
                  width="360"
                  height="36"
                  viewBox="0 0 360 36"
                  style={{ display: 'inline-block' }}
                >
                  <rect
                    x="1"
                    y="1"
                    width="358"
                    height="34"
                    rx="17"
                    ry="17"
                    fill="#fffbeb"
                    stroke="#92400e"
                    strokeWidth="2"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#78350f"
                    fontFamily="Arial, sans-serif"
                    fontSize="11"
                    fontWeight="bold"
                    letterSpacing="1.1"
                  >
                    CERTIFICATE OF ACHIEVEMENT
                  </text>
                </svg>
              ) : (
                <div style={{
                  display: 'inline-block',
                  padding: '8px 22px 7px 22px',
                  border: '2px solid #92400e',
                  borderRadius: '50px',
                  backgroundColor: '#fffbeb',
                  verticalAlign: 'middle',
                  boxSizing: 'border-box'
                }}>
                  <span style={{
                    color: '#78350f',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    display: 'inline-block',
                    lineHeight: '1.3',
                    verticalAlign: 'middle'
                  }}>CERTIFICATE OF ACHIEVEMENT</span>
                </div>
              )}
            </div>
            <div style={{ marginTop: '8px' }}>
              <h1 style={{ 
                fontFamily: 'Georgia, serif',
                fontSize: '38px',
                fontWeight: 'bold',
                color: '#1F2937',
                margin: '0 0 10px 0',
                lineHeight: '1',
                paddingBottom: '2px'
              }}>
                RoadmapCareers
              </h1>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '10px',
                color: '#4B5563',
                marginTop: '2px'
              }}>
                <div style={{ 
                  height: '1.5px', 
                  backgroundColor: '#92400e', 
                  width: '45px',
                  flexShrink: 0,
                  display: 'block'
                }}></div>
                <span style={{ 
                  fontSize: '11.5px', 
                  letterSpacing: '0.05em',
                  lineHeight: '1.4',
                  whiteSpace: 'nowrap',
                  color: '#4B5563'
                }}>Professional Development Platform</span>
                <div style={{ 
                  height: '1.5px', 
                  backgroundColor: '#92400e', 
                  width: '45px',
                  flexShrink: 0,
                  display: 'block'
                }}></div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="text-center" style={{ flexShrink: 0, marginBottom: '35px' }}>
            <p style={{ 
              fontFamily: 'Georgia, serif',
              color: '#374151',
              fontSize: '14px',
              fontStyle: 'italic',
              margin: '0 0 10px 0'
            }}>
              This is to certify that
            </p>
            
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <h2 style={{ 
                fontFamily: 'Georgia, serif',
                fontSize: '34px',
                fontWeight: 'bold',
                color: '#111827',
                margin: '0',
                lineHeight: '1.1',
                paddingBottom: '10px'
              }}>
                {userInfo?.fullName || 'Student Name'}
              </h2>
              <div style={{ 
                height: '2px', 
                backgroundColor: '#92400e',
                maxWidth: '420px',
                margin: '0 auto',
                marginTop: '2px',
                display: 'block'
              }}></div>
            </div>

            <p style={{ 
              fontFamily: 'Georgia, serif',
              color: '#374151',
              fontSize: '13.5px',
              maxWidth: '720px',
              lineHeight: '1.55',
              margin: '10px auto',
              padding: '0 16px'
            }}>
              has successfully completed the <strong>Remote Work Professional Certification</strong> examination 
              with a score of <strong>{examResult?.score || 0} out of {examResult?.totalQuestions || 0}</strong> ({examResult ? Math.round((examResult.score / examResult.totalQuestions) * 100) : 0}%), 
              demonstrating proficiency in professional development, best practices, 
              and workplace excellence.
            </p>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '35px',
              fontSize: '11px',
              color: '#4B5563',
              marginTop: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0' }}>Completion Date</p>
                <p style={{ color: '#92400e', margin: '0' }}>{completionDate}</p>
              </div>
              <div style={{ height: '32px', width: '1px', background: '#92400e' }}></div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: '#1F2937', margin: '0 0 4px 0' }}>Certificate ID</p>
                <p style={{ color: '#92400e', fontFamily: 'monospace', fontSize: '11px', margin: '0' }}>{certificateId}</p>
              </div>
            </div>
          </div>

          {/* Footer / Signatures */}
          <div className="w-full px-12" style={{ flexShrink: 0, marginBottom: '18px' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  {/* Left Signature */}
                  <td style={{ width: '30%', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '0' }}>
                    <div style={{ display: 'inline-block', width: '100%' }}>
                      <p style={{ 
                        fontFamily: 'Brush Script MT, cursive', 
                        fontSize: '21px',
                        color: '#4B5563',
                        fontStyle: 'italic',
                        margin: '0 0 7px 0',
                        lineHeight: '1.2',
                        height: '25px'
                      }}>Sarah Mitchell</p>
                      <div style={{ 
                        borderTop: '2px solid #1F2937', 
                        width: '145px',
                        margin: '0 auto 4px auto'
                      }}></div>
                      <p style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#1F2937',
                        margin: '0 0 2px 0',
                        lineHeight: '1.3'
                      }}>Certification Director</p>
                      <p style={{ 
                        fontSize: '11px',
                        color: '#4B5563',
                        margin: '0',
                        lineHeight: '1.3'
                      }}>RoadmapCareers</p>
                    </div>
                  </td>

                  {/* Center Seal */}
                  <td style={{ width: '40%', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '0' }}>
                    {/* Silver outer ring */}
                    <div style={{
                      display: 'inline-block',
                      position: 'relative',
                      padding: '4px',
                      borderRadius: '9999px',
                      background: 'linear-gradient(135deg, #e5e7eb 0%, #f9fafb 25%, #9ca3af 50%, #f3f4f6 75%, #d1d5db 100%)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 4px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{
                        position: 'relative',
                        width: '85px',
                        height: '85px',
                        borderRadius: '9999px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'radial-gradient(circle at 30% 30%, #fef3c7, #fde68a 40%, #f59e0b 80%, #b45309)',
                        boxShadow: '0 2px 12px rgba(180, 83, 9, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.3)'
                      }}>
                        {/* Outer decorative circle */}
                        <div style={{
                          position: 'absolute',
                          inset: '6px',
                          borderRadius: '9999px',
                          border: '1px solid #92400e',
                          opacity: 0.6
                        }}></div>
                        
                        {/* Inner decorative circle */}
                        <div style={{
                          position: 'absolute',
                          inset: '10px',
                          borderRadius: '9999px',
                          border: '1px dashed #d97706',
                          opacity: 0.5
                        }}></div>
                        
                        {/* Center content */}
                        <div style={{
                          position: 'relative',
                          textAlign: 'center',
                          zIndex: 10,
                          transform: isPdfMode ? 'translateY(-6px)' : 'none'
                        }}>
                          <div style={{
                            fontFamily: 'Georgia, serif',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            color: '#422006',
                            textShadow: '0 1px 2px rgba(255,255,255,0.5)'
                          }}>RC</div>
                          <div style={{
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#78350f',
                            lineHeight: '1',
                            letterSpacing: '0.05em',
                            textShadow: '0 1px 1px rgba(255,255,255,0.4)'
                          }}>CERTIFIED</div>
                          <div style={{
                            marginTop: '2px',
                            fontSize: '8px',
                            color: '#92400e',
                            lineHeight: '1',
                            fontWeight: '600'
                          }}>2026</div>
                        </div>
                        
                        {/* Decorative elements */}
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          color: '#78350f',
                          opacity: 0.7,
                          fontSize: '8px'
                        }}>★</div>
                        <div style={{
                          position: 'absolute',
                          bottom: '6px',
                          color: '#78350f',
                          opacity: 0.7,
                          fontSize: '8px'
                        }}>★</div>
                      </div>
                    </div>
                  </td>

                  {/* Right Signature */}
                  <td style={{ width: '30%', verticalAlign: 'bottom', textAlign: 'center', paddingBottom: '0' }}>
                    <div style={{ display: 'inline-block', width: '100%' }}>
                      <p style={{ 
                        fontFamily: 'Brush Script MT, cursive', 
                        fontSize: '21px',
                        color: '#4B5563',
                        fontStyle: 'italic',
                        margin: '0 0 7px 0',
                        lineHeight: '1.2',
                        height: '25px'
                      }}>Michael Chen</p>
                      <div style={{ 
                        borderTop: '2px solid #1F2937', 
                        width: '145px',
                        margin: '0 auto 4px auto'
                      }}></div>
                      <p style={{ 
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#1F2937',
                        margin: '0 0 2px 0',
                        lineHeight: '1.3'
                      }}>Director of Education</p>
                      <p style={{ 
                        fontSize: '11px',
                        color: '#4B5563',
                        margin: '0',
                        lineHeight: '1.3'
                      }}>RoadmapCareers</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Verification Footer */}
          <div className="w-full text-center" style={{ flexShrink: 0 }}>
            <p style={{ 
              fontSize: '11px',
              color: '#6B7280',
              margin: '0',
              lineHeight: '1.2'
            }}>
              View & verify: roadmapcareers.com/certificate?id={certificateId}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Download Button */}
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF
        </button>

        {/* Share Certificate */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
          <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="bg-transparent text-sm text-gray-700 outline-none min-w-[400px]"
            aria-label="Certificate share link"
          />
          <button
            type="button"
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              copied
                ? 'bg-green-600 text-white'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
        <h3 className="font-semibold text-gray-900 mb-2">What's Next?</h3>
        <ul className="space-y-2 text-gray-700 text-sm">
          <li>• Add this certificate to your LinkedIn profile</li>
          <li>• Include the Certificate ID ({certificateId}) and URL (<strong>{shareUrl}</strong>) on your resume</li>
          <li>• Share the certificate link with potential employers</li>
          <li>• <strong>Employers, recruiters, or other reviewers</strong> can view and verify your certificate online at: {shareUrl}</li>
        </ul>
      </div>
    </div>
  );
}
