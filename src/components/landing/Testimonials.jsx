import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow } from 'swiper/modules';
import { Star, CheckCircle } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';

const testimonials = [
  {
    id: 1,
    name: 'Alex Mercer',
    type: 'Elite Member',
    text: '"The level of coaching here is unmatched. I’ve trained at top facilities globally, but IronFit Elite brings a Silicon Valley standard to fitness. Every detail is perfect."',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
  },
  {
    id: 2,
    name: 'Samantha Reed',
    type: 'Pro Member',
    text: '"Transformative. The trainers don’t just count reps; they reconstruct your entire lifestyle. The recovery zones alone are worth the membership."',
    image: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
  },
  {
    id: 3,
    name: 'David Kingston',
    type: 'Basic Member',
    text: '"Even the basic membership feels VIP. The equipment is pristine, the atmosphere is focused, and everyone is there to put in the work."',
    image: 'https://images.pexels.com/photos/1431282/pexels-photo-1431282.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
  },
  {
    id: 4,
    name: 'Jessica Alba',
    type: 'Elite Member',
    text: '"I rely on IronFit to keep me in peak condition for my roles. The privacy, the exclusivity, and the results are consistently exceptional."',
    image: 'https://images.pexels.com/photos/1153369/pexels-photo-1153369.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-32 bg-iron-dark relative overflow-hidden landing-page">
      {/* Background Decor */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-iron-gold via-iron-black to-iron-black pointer-events-none"></div>

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <div className="w-8 h-[2px] bg-iron-gold"></div>
            <span className="text-iron-gold tracking-widest text-sm font-bold uppercase">Testimonials</span>
            <div className="w-8 h-[2px] bg-iron-gold"></div>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-cinematic text-5xl md:text-6xl font-bold uppercase"
          >
            The <span className="text-transparent" style={{ WebkitTextStroke: '1px #FFFFFF' }}>Elite</span> Speak
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            loop={true}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 100,
              modifier: 2.5,
              slideShadows: false,
            }}
            modules={[EffectCoverflow, Autoplay]}
            className="w-full py-10"
          >
            {testimonials.map((t) => (
              <SwiperSlide key={t.id} className="max-w-md w-full">
                <div 
                  className="glass-panel p-8 rounded-3xl relative h-full"
                  style={{ transform: 'translateZ(0)', willChange: 'transform' }}
                >
                  <div className="absolute top-8 right-8 text-iron-gold/20">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L16.411 14.593H10.154V3H21.846V14.593L19.452 21H14.017ZM2.171 21L4.565 14.593H-2.092V3H9.6V14.593L7.206 21H2.171Z" />
                    </svg>
                  </div>
                  
                  <div className="flex gap-1 mb-6 text-iron-gold">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>

                  <p className="text-iron-light/80 text-lg leading-relaxed mb-8 relative z-10">
                    {t.text}
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <img src={t.image} alt={t.name} className="w-12 h-12 rounded-full object-cover border border-white/10" />
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {t.name} <CheckCircle size={14} className="text-blue-500" />
                      </h4>
                      <p className="text-xs text-iron-light/50 tracking-wider uppercase">{t.type}</p>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
