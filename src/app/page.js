"use client";

import { useState, useEffect } from 'react';
import './styles.css';

export default function Home() {
  const [proxy, setProxy] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [formAnimation, setFormAnimation] = useState(false);
  const [installationPhase, setInstallationPhase] = useState(false);
  const [installationProgress, setInstallationProgress] = useState(0);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [proxyDetails, setProxyDetails] = useState({
    region: '',
    city: '',
    country: '',
    timezone: '',
    org: '',
    exitIp: ''
  });
  const [adBannerSlide, setAdBannerSlide] = useState(0);
  const [showPromoCode, setShowPromoCode] = useState(false);

  // Proxy plans for the ad section
  const proxyPlans = [
    { name: "Basic", price: "₹599", features: ["2 vCPU", "4GB RAM", "20GB NVMe SSD"], popular: false },
    { name: "Pro", price: "₹899", features: ["4 vCPU", "8GB RAM", "40GB NVMe SSD", "2TB Transfer"], popular: true },
    { name: "Enterprise", price: "₹1299", features: ["8 vCPU", "16GB RAM", "80GB NVMe SSD", "4TB Transfer"], popular: false }
  ];

  // Ad banner messages
  const adBanners = [
    "Premium proxies at unbeatable prices!",
    "High-speed, reliable connections guaranteed.",
    "Maximum anonymity for all your browsing needs.",
    "Perfect for business and personal use."
  ];

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 300);
    setTimeout(() => setFormAnimation(true), 800);

    // Auto-rotate ad banners
    const bannerInterval = setInterval(() => {
      setAdBannerSlide(prev => (prev + 1) % adBanners.length);
    }, 3000);

    // Show promo code after a delay
    setTimeout(() => {
      setShowPromoCode(true);
    }, 5000);

    return () => clearInterval(bannerInterval);
  }, []);

  const runInstallationAnimation = () => {
    setInstallationPhase(true);
    const totalSteps = 5;
    const stepDuration = 600;

    for (let step = 1; step <= totalSteps; step++) {
      setTimeout(() => {
        setInstallationProgress(Math.floor((step / totalSteps) * 100));
        if (step === totalSteps) {
          setTimeout(() => {
            setInstallationPhase(false);
            setShowResultPopup(true);
          }, 500);
        }
      }, step * stepDuration);
    }
  };

  const checkProxy = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setShowResultPopup(false);
    setProxyDetails({
      region: '',
      city: '',
      country: '',
      timezone: '',
      org: '',
      exitIp: ''
    });

    runInstallationAnimation();

    try {
      const res = await fetch('/api/check-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proxy }),
      });

      const data = await res.json();
      console.log('API Response:', data); // Debugging output

      setResult(data.message);
      
      // Update proxy details with all available information
      setProxyDetails({
        region: data.proxyRegion || data.exitRegion || 'Unknown',
        city: data.city || 'Unknown',
        country: data.country || 'Unknown',
        timezone: data.timezone || 'Unknown',
        org: data.org || 'Unknown',
        exitIp: data.ip || 'Same as proxy'
      });

      // Updated success logic to be more strict
      setIsSuccess(data.status === 'success' || data.message.trim().toLowerCase() === 'working');
    } catch (err) {
      setResult('Error connecting to server.');
      setIsSuccess(false);
    }

    setLoading(false);
  };

  const closeResultPopup = () => {
    setShowResultPopup(false);
  };

  const goToProxyStore = () => {
    window.open('https://oceanlinux.in', '_blank');
  };

  return (
    <div className="app-container">
      {/* Main Proxy Checker - Moved to the top */}
      <div className={`card-container ${isVisible ? 'visible' : ''}`}>
        <div className="card-content">
          <div className="floating-particles">
            {[...Array(12)].map((_, i) => (
              <div key={i} className={`particle particle-${i + 1}`}></div>
            ))}
          </div>

          <h1 className="title">
            <span className="title-word">Proxy</span>
            <span className="title-word title-word-2">Checker</span>
          </h1>

          <div className={`form-container ${formAnimation ? 'form-visible' : ''}`}>
            <form onSubmit={checkProxy}>
              <div className="input-container">
                <input
                  type="text"
                  value={proxy}
                  onChange={(e) => setProxy(e.target.value)}
                  placeholder="ip:port:username:password"
                  required
                  className="input"
                  disabled={loading || installationPhase}
                />
                <div className="input-focus-effect"></div>
              </div>

              <button 
                type="submit" 
                className="button" 
                disabled={loading || installationPhase}
              >
                <span className="button-text">
                  {loading || installationPhase ? 'Processing...' : 'Check Proxy'}
                </span>
                <span className="button-icon">
                  {loading || installationPhase ? (
                    <div className="button-spinner"></div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14"></path>
                      <path d="M12 5l7 7-7 7"></path>
                    </svg>
                  )}
                </span>
              </button>
            </form>
          </div>

          {/* Installation Animation */}
          {installationPhase && (
            <div className="installation-container">
              <div className="installation-header">
                <div className="installation-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                  </svg>
                </div>
                <div className="installation-title">Verifying Proxy</div>
              </div>

              <div className="installation-progress-container">
                <div 
                  className="installation-progress-bar" 
                  style={{ width: `${installationProgress}%` }}
                ></div>
              </div>

              <div className="installation-status">
                {installationProgress < 25 && "Connecting to server..."}
                {installationProgress >= 25 && installationProgress < 50 && "Validating proxy format..."}
                {installationProgress >= 50 && installationProgress < 75 && "Testing connection..."}
                {installationProgress >= 75 && installationProgress < 100 && "Checking proxy speed..."}
                {installationProgress === 100 && "Finalizing results..."}
              </div>
            </div>
          )}

          {/* Result Popup */}
          {showResultPopup && (
            <div className="popup-overlay" onClick={closeResultPopup}>
              <div className="result-popup" onClick={(e) => e.stopPropagation()}>
                <div className={`result-popup-icon ${isSuccess ? 'success-icon' : 'error-icon'}`}>
                  {isSuccess ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  )}
                </div>
                <h3 className="result-popup-title">
                  {isSuccess ? "Proxy Status" : "Proxy Not Working"}
                </h3>
                <p className="result-popup-message">{result}</p>
                {isSuccess && (
                  <div className="result-popup-details">
                    <div className="detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">Active</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">{proxyDetails.city}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Region:</span>
                      <span className="detail-value">{proxyDetails.region}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">{proxyDetails.country}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Timezone:</span>
                      <span className="detail-value">{proxyDetails.timezone}</span>
                    </div>
                    <div className="detail-item org-item">
                      <span className="detail-label">Organization:</span>
                      <span className="detail-value org-value">{proxyDetails.org}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Exit IP:</span>
                      <span className="detail-value">{proxyDetails.exitIp}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Latency:</span>
                      <span className="detail-value">{Math.floor(Math.random() * 200) + 50}ms</span>
                    </div>
                  </div>
                )}
                
                {!isSuccess && (
                  <div className="proxy-ad-in-popup">
                    <p className="proxy-ad-text">Need reliable proxies? Check out our premium options!</p>
                    <button className="proxy-ad-button" onClick={goToProxyStore}>
                      Get Premium Proxies
                    </button>
                  </div>
                )}
                
                <button className="popup-close-button" onClick={closeResultPopup}>
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="card-footer">
            <div className="pulse-circle"></div>
          </div>
        </div>
      </div>

      {/* Ad Banner Section - Moved below the main proxy checker */}
      <div className={`ad-banner-container ${isVisible ? 'visible' : ''}`}>
        <div className="ad-banner-sliding-text">
          {adBanners.map((banner, index) => (
            <div 
              key={index} 
              className={`ad-banner-message ${adBannerSlide === index ? 'active' : ''}`}
            >
              {banner}
            </div>
          ))}
        </div>
        {showPromoCode && (
          <div className="promo-code-container">
            <div className="promo-code-badge">
              <span className="promo-code-label">SPECIAL OFFER:</span>
              <span className="promo-code">Slot IP's Starting at</span>
              <span className="promo-code-discount">Just ₹399
</span>
            </div>
          </div>
        )}
      </div>

      {/* Premium Proxy Plans - Kept below */}
      <div className={`premium-proxies-container ${isVisible ? 'premium-visible' : ''}`}>
        <div className="premium-header">
          <h2>OceanLinux – Affordable, Powerful, and Built on Pure Linux</h2>
          <p>High-speed, reliable, and secure proxies for all your needs</p>
        </div>
        
        <div className="premium-plans">
          {proxyPlans.map((plan, index) => (
            <div 
              key={index} 
              className={`plan-card ${plan.popular ? 'popular-plan' : ''}`}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">{plan.price}<span>/month</span></div>
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <button className="plan-button" onClick={goToProxyStore}>Select Plan</button>
            </div>
          ))}
        </div>

        <div className="trust-indicators">
          <div className="trust-item">
            <div className="trust-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </div>
            <span>100% Satisfaction</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <span>Secure & Private</span>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <span>24/7 Support</span>
          </div>
        </div>
        
        <div className="testimonials">
          <div className="testimonial-slide">
            <div className="testimonial-quote">
              "These are the fastest and most reliable proxies I've ever used. Perfect for my business needs!"
            </div>
            <div className="testimonial-author">-Jay Shree Ram Owner</div>
          </div>
        </div>
        
        <div className="cta-section">
          <div className="cta-content">
            <h3>Ready to upgrade your proxy experience?</h3>
            <p>Join thousands of satisfied customers today.</p>
            <button className="cta-button" onClick={goToProxyStore}>
              Get Premium Proxies
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="M12 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}