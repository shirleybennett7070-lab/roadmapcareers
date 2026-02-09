import { useState, useRef, useEffect, useCallback } from 'react'
import Layout from '../../components/Layout'

const ANALYSIS_STEPS = [
  { label: 'Initializing facial recognition...', duration: 1200 },
  { label: 'Mapping facial landmarks...', duration: 1800 },
  { label: 'Verifying liveness detection...', duration: 2000 },
  { label: 'Cross-referencing with submitted ID photo...', duration: 2200 },
  { label: 'Running biometric analysis...', duration: 1600 },
  { label: 'Performing anti-spoofing checks...', duration: 1400 },
  { label: 'Generating confidence score...', duration: 1000 },
  { label: 'Finalizing identity match...', duration: 800 },
]

export default function CameraPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [phase, setPhase] = useState('request') // request, live, countdown, captured, analyzing, verified, submitted
  const [cameraError, setCameraError] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [capturedImage, setCapturedImage] = useState(null)
  const [analysisStep, setAnalysisStep] = useState(0)
  const [analysisProgress, setAnalysisProgress] = useState(0)

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Attach stream to video element once the live phase renders the <video>
  useEffect(() => {
    if ((phase === 'live' || phase === 'countdown') && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current
    }
  }, [phase])

  const startCamera = useCallback(async () => {
    try {
      setCameraError('')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      streamRef.current = stream
      setPhase('live') // phase change triggers re-render, then useEffect above attaches the stream
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access was denied. Please allow camera access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found. Please connect a camera and try again.')
      } else {
        setCameraError('Unable to access your camera. Please check your device settings.')
      }
    }
  }, [])

  const startCountdown = useCallback(() => {
    setPhase('countdown')
    setCountdown(3)
    let count = 3
    const interval = setInterval(() => {
      count--
      setCountdown(count)
      if (count <= 0) {
        clearInterval(interval)
        capturePhoto()
      }
    }, 1000)
  }, [])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    // Mirror the image to match preview
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setCapturedImage(imageData)

    // Stop the camera
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setPhase('captured')
  }, [])

  const retake = useCallback(() => {
    setCapturedImage(null)
    setPhase('request')
    setAnalysisStep(0)
    setAnalysisProgress(0)
  }, [])

  const startAnalysis = useCallback(() => {
    setPhase('analyzing')
    setAnalysisStep(0)
    setAnalysisProgress(0)

    let step = 0
    const totalDuration = ANALYSIS_STEPS.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0

    const runStep = () => {
      if (step >= ANALYSIS_STEPS.length) {
        setAnalysisProgress(100)
        setTimeout(() => setPhase('verified'), 600)
        return
      }
      setAnalysisStep(step)
      elapsed += ANALYSIS_STEPS[step].duration
      setAnalysisProgress(Math.round((elapsed / totalDuration) * 100))
      step++
      setTimeout(runStep, ANALYSIS_STEPS[step - 1].duration)
    }
    setTimeout(runStep, 400)
  }, [])

  const handleFinalSubmit = useCallback(() => {
    setPhase('submitted')
    // Clear all session data
    setTimeout(() => {
      sessionStorage.clear()
    }, 500)
  }, [])

  // ——— Request Phase ———
  if (phase === 'request') {
    return (
      <Layout step={10} totalSteps={11} stepLabel="Identity Photo Verification">
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-navy-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Live Identity Photo Verification</h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto mb-6">
            As a final step, we need to verify your identity with a live photo. This will be cross-referenced
            with your submitted government ID to confirm you are who you claim to be.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
            <h4 className="text-sm font-semibold text-amber-800 mb-2">Before you begin:</h4>
            <ul className="text-xs text-amber-700 space-y-1.5">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Ensure you are in a <strong>well-lit area</strong> with your face clearly visible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Remove sunglasses, hats, or anything covering your face</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Position yourself <strong>directly facing the camera</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">•</span>
                <span>Keep a neutral expression and hold still during capture</span>
              </li>
            </ul>
          </div>

          {cameraError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-md mx-auto mb-6">
              <p className="text-sm text-red-700">{cameraError}</p>
            </div>
          )}

          <button
            onClick={startCamera}
            className="px-10 py-4 rounded-xl text-base font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
            Enable Camera & Begin
          </button>

          <div className="mt-8">
            <button onClick={() => window.history.back()} className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">← Back to Review</button>
          </div>
        </div>
      </Layout>
    )
  }

  // ——— Live / Countdown Phase ———
  if (phase === 'live' || phase === 'countdown') {
    return (
      <Layout step={10} totalSteps={11} stepLabel="Identity Photo Verification">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Position Your Face</h2>
          <p className="text-slate-500 text-sm mb-6">Center your face within the oval guide below, then click capture.</p>

          <div className="relative inline-block rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200 bg-black">
            {/* Live video */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-w-md"
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Oval face guide overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-64 border-[3px] border-dashed border-white/60 rounded-[50%]" />
            </div>

            {/* Corner brackets */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-emerald-400 rounded-tl-lg" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-emerald-400 rounded-tr-lg" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-emerald-400 rounded-bl-lg" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-emerald-400 rounded-br-lg" />

            {/* REC indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-xs font-mono font-bold">LIVE</span>
            </div>

            {/* Countdown overlay */}
            {phase === 'countdown' && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-8xl font-extrabold drop-shadow-2xl animate-ping" style={{ animationDuration: '1s' }}>
                  {countdown}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6">
            {phase === 'live' && (
              <button
                onClick={startCountdown}
                className="px-10 py-4 rounded-xl text-base font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                Capture Photo
              </button>
            )}
            {phase === 'countdown' && (
              <p className="text-sm font-semibold text-slate-500">Hold still...</p>
            )}
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </Layout>
    )
  }

  // ——— Captured Phase (preview) ———
  if (phase === 'captured') {
    return (
      <Layout step={10} totalSteps={11} stepLabel="Identity Photo Verification">
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Review Your Photo</h2>
          <p className="text-slate-500 text-sm mb-6">Make sure your face is clearly visible and well-lit before proceeding.</p>

          <div className="relative inline-block rounded-2xl overflow-hidden shadow-xl border-2 border-slate-200">
            <img src={capturedImage} alt="Captured selfie" className="w-full max-w-md" />
            <div className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              CAPTURED
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={retake}
              className="px-8 py-3 rounded-xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              Retake Photo
            </button>
            <button
              onClick={startAnalysis}
              className="px-10 py-3.5 rounded-xl text-sm font-bold bg-navy-900 hover:bg-navy-800 text-white shadow-lg shadow-navy-900/20 transition-all cursor-pointer"
            >
              Verify Identity →
            </button>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </Layout>
    )
  }

  // ——— Analyzing Phase ———
  if (phase === 'analyzing') {
    return (
      <Layout step={10} totalSteps={11} stepLabel="Identity Photo Verification">
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div
              className="absolute inset-0 rounded-full border-4 border-navy-600 border-t-transparent animate-spin"
              style={{ animationDuration: '1.2s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-8 h-8 text-navy-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 mb-2">Analyzing Your Photo</h2>
          <p className="text-slate-500 text-sm mb-8">Please wait while we verify your identity. Do not close this page.</p>

          {/* Progress bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-navy-600 to-navy-800 rounded-full transition-all duration-500"
                style={{ width: `${analysisProgress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-slate-400">{analysisProgress}%</span>
              <span className="text-xs text-slate-400">Processing</span>
            </div>
          </div>

          {/* Step list */}
          <div className="max-w-sm mx-auto text-left space-y-2">
            {ANALYSIS_STEPS.map((step, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-sm py-1.5 transition-all duration-300 ${
                i < analysisStep ? 'text-emerald-600' : i === analysisStep ? 'text-navy-800 font-semibold' : 'text-slate-300'
              }`}>
                {i < analysisStep ? (
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : i === analysisStep ? (
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-navy-600 animate-pulse" />
                  </div>
                ) : (
                  <div className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  </div>
                )}
                <span>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    )
  }

  // ——— Verified Phase ———
  if (phase === 'verified') {
    return (
      <Layout step={10} totalSteps={11} stepLabel="Identity Photo Verification">
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.746 3.746 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 mb-3">Identity Verified</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
            Your photo has been captured and recorded. You can now submit your verification.
          </p>

          <button
            onClick={handleFinalSubmit}
            className="px-12 py-4 rounded-xl text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            Submit Verification
          </button>
        </div>
      </Layout>
    )
  }

  // ——— Submitted (Final Success) ———
  return (
    <Layout step={11} totalSteps={11} stepLabel="Complete" progressColor="emerald" warnOnLeave={false}>
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">Verification Complete</h2>
        <p className="text-slate-600 text-base max-w-lg mx-auto mb-4">
          Your background check information and identity verification have been successfully submitted for review.
        </p>
        <p className="text-slate-500 text-sm max-w-lg mx-auto mb-8">
          The verified report will be completed and delivered to the requesting employer within <strong>24–48 hours</strong>. 
          You will receive a confirmation email when the report is ready.
        </p>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-md mx-auto text-left">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">What Happens Next</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Your identity has been verified via live photo</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Your information is being verified against official records</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Criminal background check is processing</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>International trust & compliance checks in progress</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>References and employment will be contacted</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-emerald-500 mt-0.5">✓</span>
              <span>Report delivered to employer within 24–48 hours</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-8">You may close this page. Thank you for completing the verification.</p>
      </div>
    </Layout>
  )
}
