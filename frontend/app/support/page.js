'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMail, HiQuestionMarkCircle, HiPaperAirplane, HiCheckCircle, HiExternalLink, HiChevronDown, HiShieldCheck, HiLockClosed } from 'react-icons/hi';
import { FaDiscord, FaHeadset, FaYoutube, FaInstagram, FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useSiteSettings } from '@/context/SiteSettingsContext';

const faqs = [
  { q: 'How do I download free panels?', a: 'Login to your account, browse the Free Panels section, click "Download" on any panel, complete the shortener step, and your download will start automatically.' },
  { q: 'How do I purchase a paid panel?', a: 'Browse the Paid Panels section, select a panel, click "Buy Now", and contact us via Discord or Telegram for payment and delivery.' },
  { q: 'What payment methods do you accept?', a: 'Currently we accept payments via UPI, PayPal, and Razorpay. Contact us on Discord or Telegram for more details.' },
  { q: 'How do I get support?', a: 'Join our Discord server or Telegram group for instant support. You can also use the contact form below and we will get back to you within 24 hours.' },
  { q: 'Are the panels safe to use?', a: 'Yes! All our panels are scanned and verified for security. We ensure 100% safe downloads for all our users.' },
  { q: 'Can I get a refund?', a: 'We offer a 7-day refund policy on premium panels if the product is not working as described. Contact us with your purchase details.' },
];

const terms = [
  { title: 'Acceptance of Terms', text: 'By accessing and using VISION X CHEATS, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.' },
  { title: 'Use of Services', text: 'Our platform provides digital panels, tools, and utilities. You agree to use these services only for lawful purposes and in accordance with these terms.' },
  { title: 'Account Registration', text: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.' },
  { title: 'Purchases and Payments', text: 'All purchases of paid panels and license keys are final. Refunds are handled on a case-by-case basis at our sole discretion.' },
  { title: 'Intellectual Property', text: 'All content on VISION X CHEATS is the property of VISION X CHEATS and is protected by intellectual property laws.' },
  { title: 'Limitation of Liability', text: 'VISION X CHEATS shall not be held liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services.' },
];

const privacy = [
  { title: 'Information We Collect', text: 'We collect information you provide directly, including your username, email address, and profile picture when you create an account.' },
  { title: 'How We Use Your Information', text: 'We use your information to provide and improve our services, personalize your experience, and communicate with you.' },
  { title: 'Data Security', text: 'We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.' },
  { title: 'Cookies', text: 'We use cookies and similar technologies to maintain your session, remember your preferences, and analyze usage patterns.' },
  { title: 'Your Rights', text: 'You have the right to access, correct, or delete your personal information. You can manage your profile through your account settings.' },
];

const defaultSupportOptions = [
  { title: 'Discord Server', description: 'Join our community for instant support, updates, and discussions.', icon: FaDiscord, color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20', link: '', btnText: 'Join Discord' },
  { title: 'YouTube Channel', description: 'Subscribe for tutorials, previews, and updates.', icon: FaYoutube, color: 'from-red-500 to-red-600', bgColor: 'bg-red-50 dark:bg-red-900/20', link: '', btnText: 'Subscribe' },
  { title: 'Instagram', description: 'Follow us on Instagram for latest updates and behind the scenes.', icon: FaInstagram, color: 'from-pink-500 to-purple-600', bgColor: 'bg-pink-50 dark:bg-pink-900/20', link: '', btnText: 'Follow' },
  { title: 'WhatsApp', description: 'Message us directly on WhatsApp for instant support.', icon: FaWhatsapp, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20', link: '', btnText: 'Chat Now' },
];

function SectionDivider({ icon: Icon, title, id }) {
  return (
    <div id={id} className="flex flex-col items-center mt-20 mb-10 scroll-mt-24">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <div className="w-16 h-1 bg-gradient-to-r from-primary-400 to-accent-500 rounded-full mt-3" />
    </div>
  );
}

function AccordionItem({ item, isOpen, onToggle }) {
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
        <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">{item.title || item.q}</span>
        <HiChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-5 pb-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.text || item.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SupportPage() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [openTerm, setOpenTerm] = useState(null);
  const [openPrivacy, setOpenPrivacy] = useState(null);
  const [supportOptions, setSupportOptions] = useState(defaultSupportOptions);
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings) {
      setSupportOptions(prev => prev.map(opt => {
        if (opt.title === 'Discord Server' && settings.discordLink) return { ...opt, link: settings.discordLink };
        if (opt.title === 'YouTube Channel' && settings.youtubeLink) return { ...opt, link: settings.youtubeLink };
        if (opt.title === 'Instagram' && settings.instagramLink) return { ...opt, link: settings.instagramLink };
        if (opt.title === 'WhatsApp' && settings.whatsappLink) return { ...opt, link: settings.whatsappLink };
        return opt;
      }));
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitted(true);
    toast.success('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 text-sm font-medium mb-4">
            <FaHeadset className="w-4 h-4" />
            <span>We are here to help</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Support <span className="gradient-text">Center</span>
          </h1>
          <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Need help? We have multiple ways to get in touch. Choose the option that works best for you.
          </p>
        </motion.div>

        {/* Contact Options */}
        <SectionDivider icon={HiMail} title="Contact Us" id="contact" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {supportOptions.filter(o => o.link).map((option, i) => {
            const Icon = option.icon;
            return (
              <motion.div key={option.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                className={`glass-card rounded-2xl p-6 text-center hover-lift ${option.bgColor}`}>
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-lg mb-4`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{option.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{option.description}</p>
                <a href={option.link} target="_blank" rel="noopener noreferrer"
                  className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-gradient-to-r ${option.color} shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-sm`}>
                  <span>{option.btnText}</span>
                  <HiExternalLink className="w-4 h-4" />
                </a>
              </motion.div>
            );
          })}
        </div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-2xl mx-auto mt-16">
          <div className="glass-card rounded-3xl p-8 md:p-10">
            <div className="text-center mb-8">
              <HiMail className="w-10 h-10 mx-auto text-primary-400 mb-3" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Send us a Message</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">Fill out the form and we will get back to you</p>
            </div>
            {submitted ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center py-8">
                <HiCheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                <p className="text-gray-500 dark:text-gray-400">Thank you for reaching out. We will respond within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name *</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="vision x cheats" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Email *</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="visionxcheat@gmail.com" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject</label>
                  <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="input-field" placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message *</label>
                  <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="input-field h-28 resize-none" placeholder="Describe your issue in detail..." required />
                </div>
                <button type="submit" className="w-full btn-primary py-3 text-base">
                  <HiPaperAirplane className="w-5 h-5 mr-2" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </motion.div>

        {/* FAQ */}
        <SectionDivider icon={HiQuestionMarkCircle} title="FAQ" id="faq" />
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.04 }}>
              <AccordionItem item={faq} isOpen={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
            </motion.div>
          ))}
        </div>

        {/* Terms */}
        <SectionDivider icon={HiShieldCheck} title="Terms of Service" id="terms" />
        <div className="max-w-3xl mx-auto space-y-3">
          {terms.map((term, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.04 }}>
              <AccordionItem item={term} isOpen={openTerm === i} onToggle={() => setOpenTerm(openTerm === i ? null : i)} />
            </motion.div>
          ))}
        </div>

        {/* Privacy */}
        <SectionDivider icon={HiLockClosed} title="Privacy Policy" id="privacy" />
        <div className="max-w-3xl mx-auto space-y-3">
          {privacy.map((p, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.04 }}>
              <AccordionItem item={p} isOpen={openPrivacy === i} onToggle={() => setOpenPrivacy(openPrivacy === i ? null : i)} />
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
