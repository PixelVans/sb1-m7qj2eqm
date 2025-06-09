import React, { useState, useRef } from 'react';
import { MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';
import { useSettings } from '@/lib/store';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useSettings();
  const isDark = theme === 'dark';
  const form = useRef<HTMLFormElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Message is required');
      return;
    }

    setLoading(true);

    try {
      await emailjs.sendForm(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        form.current!,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      toast.success('Message sent successfully!');
      setFirstName('');
      setEmail('');
      setCategory('technical');
      setMessage('');
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const textColor = isDark ? 'text-white' : 'text-black';
  const subTextColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const inputBg = isDark ? 'bg-white/10 text-white ring-white/10' : 'bg-white text-black ring-gray-300';
  const labelColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const formBg = isDark ? 'bg-white/5' : 'bg-white border border-gray-200';

  return (
    <div className="flex flex-col justify-center px-2 sm:px-6  ">
      <div className="  grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column */}
       

        <div className="flex flex-col mx-auto items-center md:items-start text-center md:text-left  py-5 md:py-24">
          <MessageCircleIcon className="h-24 w-24 text-purple-500 mb-4 mx-auto " />
          <h1 className={`text-3xl  ${textColor} mx-auto`}>Contact Us</h1>
          <p className={`${subTextColor} mt-2`}>
            We'd love to hear your thoughts or feedback!
          </p>
        </div>

        {/* Right Column: Form */}
        <form
          ref={form}
          onSubmit={handleSend}
          className={`${formBg} backdrop-blur-lg rounded-lg px-3 sm:px-6 py-6 shadow-xl space-y-6 lg:mr-20 `}
        >
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className={`block text-sm font-medium ${labelColor} mb-1`}>
            Contact Name
            </label>
            <input
              type="text"
              id="firstName"
              name="first_name"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full rounded-lg border-0 py-2 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-purple-500 sm:text-sm ${inputBg}`}
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${labelColor} mb-1`}>
            Contact Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-lg border-0 py-2 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-purple-500 sm:text-sm ${inputBg}`}
              placeholder="you@example.com"
            />
          </div>

         {/* Category */}
          <div>
            <label htmlFor="category" className={`block text-sm font-medium ${labelColor} mb-1`}>
              What is your message about?
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full rounded-lg border-0 py-2 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-purple-500 sm:text-sm appearance-none ${inputBg}`}
            >
              <option value="technical">Technical Issue</option>
              <option value="payment">Payment Issue</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className={`block text-sm text-slate-300 italic ${labelColor} mb-2 pt-4`}>
            Share your message and we'll respond ASAP.
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full rounded-lg border-0 py-2 px-3 shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-purple-500 sm:text-sm ${inputBg}`}
              placeholder="Type your message here..."
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
             className={`w-full ${theme === 'dark' ? ' bg-purple-600 hover:bg-purple-700 ' : ' bg-purple-500 '} `}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
