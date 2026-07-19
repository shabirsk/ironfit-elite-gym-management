import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Expand } from 'lucide-react';

const images = [
  {
    src: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/1954524/pexels-photo-1954524.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
  {
    src: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/416809/pexels-photo-416809.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
  {
    src: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
  {
    src: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
  {
    src: 'https://images.pexels.com/photos/841131/pexels-photo-841131.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/841131/pexels-photo-841131.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
  {
    src: 'https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&w=800',
    webp: 'https://images.pexels.com/photos/3289711/pexels-photo-3289711.jpeg?auto=compress&cs=tinysrgb&fm=webp&w=800',
  },
];

const Gallery = () => {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <section className="py-32 bg-iron-black relative overflow-hidden landing-page">
      <div className="container mx-auto px-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <div className="w-8 h-[2px] bg-iron-gold"></div>
              <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Inside IronFit</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-cinematic text-5xl md:text-6xl font-bold uppercase"
            >
              The <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Facility</span>
            </motion.h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-iron-light/60 max-w-sm"
          >
            A 50,000 sq ft playground for the dedicated. Equipped with state-of-the-art machinery and recovery zones.
          </motion.p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {images.map((img, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer break-inside-avoid shadow-lg shadow-black/50"
              onClick={() => setSelectedImg(img.src)}
            >
              <picture>
                <source srcSet={img.webp} type="image/webp" />
                <img 
                  src={img.src}
                  alt="Gym Facility"
                  loading="lazy"
                  decoding="async"
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                />
              </picture>
              <div className="absolute inset-0 bg-iron-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white transform scale-50 group-hover:scale-100 transition-transform duration-300 delay-100">
                  <Expand size={20} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-iron-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedImg(null)}
          >
            <button 
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-iron-black transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); setSelectedImg(null); }}
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImg}
              alt="Gym Facility Enlarged"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
