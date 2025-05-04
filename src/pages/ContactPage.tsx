import React, { useState, useRef } from 'react';
import { MessageCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

export default function ContactPage() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('technical');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

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
      setPhone('');
      setCategory('technical');
      setMessage('');
    } catch (error) {
      console.error('EmailJS error:', error);
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121212] flex flex-col justify-center">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Heading */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left mx-auto py-24">
          <MessageCircleIcon className="h-24 w-24 text-purple-500 mb-4 mx-auto " />
          <h1 className="text-3xl font-bold font-rajdhani text-white mx-auto">Contact Us</h1>
          <p className="text-gray-400 mt-2">
            We’d love to hear your thoughts or feedback!
          </p>
        </div>

        {/* Right Column: Form */}
        <form
          ref={form}
          onSubmit={handleSend}
          className="bg-white/5 backdrop-blur-lg rounded-lg px-8 py-5 shadow-xl space-y-6"
        >
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-1">
              First Name (optional)
            </label>
            <input
              type="text"
              id="firstName"
              name="first_name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-purple-500 sm:text-sm"
              placeholder="Enter your name"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-purple-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">
              Phone (optional)
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-purple-500 sm:text-sm"
              placeholder="+XXXXXXXXXX"
            />
          </div>

          {/* Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              What is your message about?
            </label>
            <select
              id="category"
              name="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-purple-500 sm:text-sm appearance-none"
            >
              <option value="technical">Technical Issue</option>
              <option value="payment">Payment Issue</option>
              <option value="feedback">Feedback</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1 pt-4">
              Describe your message and we will get back to you ASAP
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border-0 py-2 px-3 bg-white/10 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-purple-500 sm:text-sm"
              placeholder="Type your message here..."
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  );
}
