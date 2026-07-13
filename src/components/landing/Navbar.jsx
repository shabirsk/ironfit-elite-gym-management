import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Programs', href: '#programs' },
  { name: 'Trainers', href: '#trainers' },
  { name: 'Membership', href: '#membership' },
  { name: 'Testimonials', href: '#testimonials' },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
        isScrolled ? 'py-4 bg-iron-black/80 backdrop-blur-md border-b border-white/10' : 'py-6 bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 group">
          <span className="font-cinematic text-3xl font-bold tracking-wider text-iron-light group-hover:text-iron-gold transition-colors duration-300">
            IRON
          </span>
          <span className="font-cinematic text-3xl font-light text-iron-gold">FIT</span>
          <span className="text-[10px] uppercase tracking-widest text-iron-light/60 ml-2 mt-2">Elite</span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="relative text-sm font-medium tracking-wide text-iron-light/80 hover:text-iron-light transition-colors group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-iron-gold transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/admin/login"
            className="text-xs font-medium tracking-wide text-iron-light/50 hover:text-iron-light/90 transition-colors uppercase"
          >
            Admin
          </Link>
          <Link
            to="/member/login"
            className="text-sm font-medium tracking-wide text-iron-light hover:text-iron-gold transition-colors"
          >
            Member Login
          </Link>
          <Link
            to="/member/register"
            className="px-6 py-2.5 bg-iron-gold text-iron-black text-sm font-bold tracking-wide rounded-sm hover:bg-white transition-colors duration-300"
          >
            JOIN ELITE
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-iron-light"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 bg-iron-black/95 backdrop-blur-xl border-b border-white/10 p-6 flex flex-col gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-lg font-medium text-iron-light"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </a>
          ))}
          <div className="h-px bg-white/10 w-full my-2"></div>
          <Link to="/admin/login" className="text-base font-medium text-iron-light/50">
            Admin Login
          </Link>
          <Link to="/member/login" className="text-lg font-medium text-iron-light">
            Member Login
          </Link>
          <Link to="/member/register" className="text-lg font-medium text-iron-gold">
            Join Elite
          </Link>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Navbar;
