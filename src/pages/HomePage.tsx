import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { WalletConnect, MeshBackground, Marquee } from '../components';
import { Shield, Zap, Globe, Layers } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();
  const { wallet } = useAppStore();
  const [isShadowMode, setIsShadowMode] = useState(false);
  const [headline, setHeadline] = useState('Beyond the\nSurface.');
  const [buttonText, setButtonText] = useState('INITIALIZE_DECRYPT');
  const [revealedTexts, setRevealedTexts] = useState<{[key: string]: boolean}>({});

  const archiveData = [
    {
      id: 'alpha',
      title: 'PROJECT_ALPHA',
      text: 'Lead Architect for complex frontend solutions utilizing React and WebGL. (00:01)',
    },
    {
      id: 'beta',
      title: 'SYSTEM_OPTIMIZATION',
      text: 'Reduced load times by 40% through advanced asset caching strategies. (00:02)',
    },
    {
      id: 'gamma',
      title: 'USER_VELOCITY',
      text: 'Designed interaction patterns that increased user retention metrics significantly. (00:03)',
    },
  ];

  const features = [
    {
      icon: Shield,
      title: 'Secure Routing',
      description: 'Multi-sig protected transactions with verified smart contracts',
    },
    {
      icon: Zap,
      title: 'Instant Settlement',
      description: 'Lightning-fast stablecoin transfers across all chains',
    },
    {
      icon: Globe,
      title: 'Multi-Chain',
      description: 'Support for Ethereum, Polygon, and more networks',
    },
    {
      icon: Layers,
      title: 'Unified Interface',
      description: 'Single interface for all your stablecoin operations',
    },
  ];

  const handleDecrypt = () => {
    if (isShadowMode) {
      window.location.reload();
      return;
    }

    setIsShadowMode(true);
    document.body.classList.add('shadow-mode');
    setButtonText('SYSTEM_OVERRIDE_COMPLETE');
    setHeadline('BREACHING CORE.');

    // Stagger reveal for archive texts
    archiveData.forEach((item, index) => {
      setTimeout(() => {
        setRevealedTexts(prev => ({ ...prev, [item.id]: true }));
      }, index * 800);
    });
  };

  const renderRevealText = (text: string, shouldReveal: boolean) => {
    if (!shouldReveal) {
      return <span className="font-mono">{text}</span>;
    }

    return (
      <span className="font-mono">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="char"
            style={{ animationDelay: `${index * 0.03}s` }}
          >
            {char}
          </span>
        ))}
      </span>
    );
  };

  // Add CSS for revealed chars
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .char {
        opacity: 0;
        display: inline-block;
      }
      .char.revealed {
        animation: revealChar 0.1s forwards;
      }
      @keyframes revealChar {
        0% { opacity: 0; transform: translateY(10px); }
        100% { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    if (isShadowMode) {
      const timers: NodeJS.Timeout[] = [];
      archiveData.forEach((_, index) => {
        const timer = setTimeout(() => {
          const chars = document.querySelectorAll('.char');
          chars.forEach((el, i) => {
            setTimeout(() => {
              el.classList.add('revealed');
            }, i * 30);
          });
        }, index * 800 + 100);
        timers.push(timer);
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [isShadowMode]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <MeshBackground />
      
      <div className="container mx-auto px-5 relative z-10">
        {/* Header */}
        <header className="py-8 flex justify-between items-center">
          <div 
            className="font-bold text-xl tracking-widest"
            style={{ 
              color: 'var(--accent-color)',
              textShadow: isShadowMode ? 'none' : '0 0 10px var(--accent-glow)'
            }}
          >
            SHADOW_ARCHIVE // 01
          </div>
          <WalletConnect />
        </header>

        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col justify-center items-start">
          <div className="glass-panel max-w-xl mb-8">
            <div className="relative">
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight mb-8"
                style={{ 
                  color: isShadowMode ? '#000' : 'var(--text-color)',
                  textShadow: isShadowMode ? '2px 2px 0px var(--accent-color)' : 'none'
                }}
              >
                {headline.split('\n').map((line, i) => (
                  <span key={i}>
                    {line}
                    {i < headline.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </h1>
            </div>
            <p className="text-lg leading-relaxed mb-8" style={{ color: '#ccc' }}>
              Navigating the duality of digital aesthetics. 
              Experience the standard interface, or decrypt the hidden layers.
            </p>
            <button 
              onClick={handleDecrypt}
              className="btn-primary px-8 py-4 font-bold tracking-wider uppercase cursor-pointer transition-all duration-300"
              style={{ 
                border: '1px solid var(--accent-color)',
                color: 'var(--accent-color)'
              }}
            >
              {buttonText}
            </button>
          </div>
        </section>

        {/* Archive Section */}
        <section id="archive" className="py-20 min-h-[60vh]">
          <h2 
            className="text-2xl font-bold pb-4"
            style={{ borderBottom: '1px solid var(--accent-color)' }}
          >
            // ARCHIVE_DATA
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {archiveData.map((item) => (
              <div key={item.id} className="border-b border-white/10 pb-6">
                <div 
                  className="text-2xl font-bold mb-2"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {item.title}
                </div>
                <div 
                  id={`text-${item.id}`}
                  className="font-mono"
                  style={{ color: 'var(--text-color)' }}
                >
                  {revealedTexts[item.id] ? renderRevealText(item.text, true) : item.text}
                </div>
              </div>
            ))}
          </div>

          {/* Easter Egg */}
          <div id="easter-egg" className="mt-8 font-mono p-4" style={{ border: '1px dashed var(--accent-color)' }}>
            {'\u003E'} ACCESS GRANTED.<br/>
            {'\u003E'} IDENTITY CONFIRMED: SENIOR FRONTEND ARCHITECT.<br/>
            {'\u003E'} SKILLSET: JAVASCRIPT, HTML5, CSS3, WEBGL, REACT.<br/>
            {'\u003E'} MISSION: DECONSTRUCT BARRIERS BETWEEN DESIGN AND CODE.
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20">
          <h2 
            className="text-2xl font-bold pb-4 mb-12"
            style={{ borderBottom: '1px solid var(--accent-color)' }}
          >
            // FEATURES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="glass-panel">
                <feature.icon 
                  className="w-10 h-10 mb-4" 
                  style={{ color: 'var(--accent-color)' }}
                />
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="glass-panel text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Start?</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">
              Connect your wallet to start using the Unified Stablecoin Router. 
              Experience seamless cross-chain transactions.
            </p>
            {wallet ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="btn-primary px-8 py-4 font-bold tracking-wider uppercase cursor-pointer transition-all duration-300"
                style={{ 
                  border: '1px solid var(--accent-color)',
                  color: 'var(--accent-color)'
                }}
              >
                Go to Dashboard
              </button>
            ) : (
              <p className="text-gray-400">Connect your wallet to continue</p>
            )}
          </div>
        </section>
      </div>

      <Marquee />
    </div>
  );
}
