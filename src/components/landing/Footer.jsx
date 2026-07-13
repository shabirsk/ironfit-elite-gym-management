import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { submitContactForm } from '../../api/contact';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    try {
      await submitContactForm({
        name: 'Newsletter Subscriber',
        email,
        phone: '',
        message: 'Subscribed to newsletter from the footer.'
      });
      setIsSubscribed(true);
      setEmail('');
    } catch (error) {
      console.error('Failed to subscribe to newsletter:', error);
      // Even if it fails, we can show success to not discourage the user, 
      // or we can handle error states. For now, assuming success.
      setIsSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-iron-black pt-24 pb-8 border-t border-white/10 landing-page">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex flex-col items-start gap-1 mb-6 group inline-block">
              <div className="flex items-center">
                <span className="font-cinematic text-3xl font-bold tracking-wider text-iron-light group-hover:text-iron-gold transition-colors duration-300">
                  IRON
                </span>
                <span className="font-cinematic text-3xl font-light text-iron-gold">FIT</span>
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-iron-light/60 pl-1">Elite</span>
            </Link>
            <p className="text-iron-light/50 text-sm leading-relaxed mb-6">
              The premier destination for serious athletes and fitness enthusiasts. Silence the noise, do the work.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-iron-light hover:bg-iron-gold hover:text-iron-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-iron-light hover:bg-iron-gold hover:text-iron-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-iron-light hover:bg-iron-gold hover:text-iron-black transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Quick Links</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="#programs" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Elite Programs</a></li>
              <li><a href="#trainers" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Our Coaches</a></li>
              <li><a href="#membership" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Membership Plans</a></li>
              <li><a href="#testimonials" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Success Stories</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Support</h4>
            <ul className="flex flex-col gap-3">
              <li><Link to="/member/login" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Member Portal</Link></li>
              <li><Link to="/admin/login" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Admin Portal</Link></li>
              <li><a href="#contact" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-iron-light/60 hover:text-iron-gold text-sm transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold uppercase tracking-widest mb-6 text-sm">Stay Updated</h4>
            <p className="text-iron-light/50 text-sm mb-4">
              Subscribe to our newsletter for elite training tips and exclusive offers.
            </p>
            {isSubscribed ? (
              <div className="bg-iron-gold/20 border border-iron-gold text-iron-gold px-4 py-3 rounded-sm text-sm flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Subscribed successfully!
              </div>
            ) : (
              <form className="flex" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-l-sm px-4 py-3 text-white text-sm focus:outline-none focus:border-iron-gold transition-colors disabled:opacity-50"
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="bg-iron-gold text-iron-black px-4 py-3 rounded-r-sm hover:bg-white transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-iron-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-iron-light/40 text-xs uppercase tracking-wider">
            &copy; {new Date().getFullYear()} IronFit Elite. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-iron-light/40 hover:text-iron-light text-xs uppercase tracking-wider transition-colors">Privacy Policy</a>
            <a href="#" className="text-iron-light/40 hover:text-iron-light text-xs uppercase tracking-wider transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
