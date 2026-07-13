import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Use real API
      const { submitContactForm } = await import('../../api/contact');
      await submitContactForm(formData);
      setIsSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      // Optional: show error message
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-32 bg-iron-black relative overflow-hidden landing-page">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-[2px] bg-iron-gold"></div>
            <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Get In Touch</span>
            <div className="w-8 h-[2px] bg-iron-gold"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-cinematic text-5xl md:text-6xl font-bold uppercase"
          >
            Begin Your <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Legacy</span>
          </motion.h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 bg-iron-dark rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          
          {/* Left: Info & Map */}
          <div className="w-full lg:w-5/12 bg-iron-black/50 p-8 lg:p-12 relative overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-20">
              <img src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Gym" className="w-full h-full object-cover mix-blend-luminosity" />
            </div>
            
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="font-cinematic text-3xl font-bold uppercase text-white mb-6">Contact Us</h3>
                <p className="text-iron-light/70 text-sm mb-10 max-w-sm">
                  Ready to transform? Drop us a line or visit our facility. Our elite team is ready to assist you.
                </p>

                <div className="flex flex-col gap-8 mb-10">
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-iron-gold group-hover:text-iron-black transition-colors shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Location</h4>
                      <p className="text-iron-light/60 text-sm">Bangalore, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-iron-gold group-hover:text-iron-black transition-colors shrink-0">
                      <Phone size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Phone</h4>
                      <p className="text-iron-light/60 text-sm">+91 630 234 3426</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-iron-gold group-hover:text-iron-black transition-colors shrink-0">
                      <Mail size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Email</h4>
                      <p className="text-iron-light/60 text-sm">shaikshabir967@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimal Map Placeholder (Visual) */}
              <a href="https://maps.google.com/?q=Bangalore,+India" target="_blank" rel="noopener noreferrer" className="w-full h-32 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group block cursor-pointer">
                <img src="https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Map Location" className="w-full h-full object-cover opacity-50 filter grayscale blur-[1px] group-hover:blur-0 group-hover:opacity-70 transition-all duration-500" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/10 transition-colors duration-500">
                  <span className="text-iron-gold font-bold text-xs uppercase tracking-widest bg-black/80 px-4 py-2 rounded backdrop-blur-sm border border-iron-gold/50 group-hover:border-iron-gold group-hover:scale-105 transition-all shadow-lg">View on Maps</span>
                </div>
              </a>
            </div>
          </div>

          {/* Right: Glassmorphism Form */}
          <div className="w-full lg:w-7/12 p-8 lg:p-12 relative z-10">
            <h3 className="font-cinematic text-3xl font-bold uppercase text-white mb-8">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative group">
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-iron-gold transition-colors peer"
                    placeholder=" "
                  />
                  <label htmlFor="name" className="absolute left-4 top-4 text-iron-light/50 text-xs uppercase tracking-wider transition-all peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-iron-gold peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                    Full Name
                  </label>
                </div>
                <div className="relative group">
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-iron-gold transition-colors peer"
                    placeholder=" "
                  />
                  <label htmlFor="email" className="absolute left-4 top-4 text-iron-light/50 text-xs uppercase tracking-wider transition-all peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-iron-gold peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                    Email Address
                  </label>
                </div>
              </div>

              <div className="relative group">
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-iron-gold transition-colors peer"
                  placeholder=" "
                />
                <label htmlFor="phone" className="absolute left-4 top-4 text-iron-light/50 text-xs uppercase tracking-wider transition-all peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-iron-gold peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                  Phone Number
                </label>
              </div>

              <div className="relative group flex-grow">
                <textarea
                  id="message"
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full h-full min-h-[120px] bg-white/5 border border-white/10 rounded-lg px-4 pt-6 pb-2 text-white focus:outline-none focus:border-iron-gold transition-colors peer resize-none"
                  placeholder=" "
                ></textarea>
                <label htmlFor="message" className="absolute left-4 top-4 text-iron-light/50 text-xs uppercase tracking-wider transition-all peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-iron-gold peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-[10px]">
                  Your Message
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="group relative w-full flex items-center justify-center gap-3 bg-iron-gold text-iron-black font-bold uppercase tracking-widest py-4 rounded-lg overflow-hidden transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 mt-2"
              >
                <span className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></span>
                <span className="relative flex items-center gap-2">
                  {isSubmitting ? (
                    'Sending...'
                  ) : isSuccess ? (
                    'Message Sent!'
                  ) : (
                    <>Send Message <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
