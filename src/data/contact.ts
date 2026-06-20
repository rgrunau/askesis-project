export const contactPageCopy = {
  eyebrow: 'Contact',
  heading: "Tell me where you're starting from.",
  body: 'Coaching enquiries, questions about the writing, or just a note. I read everything and reply to most.',
  contactDetails: [
    { label: 'Email', value: 'hello@askesisproject.com' },
    { label: 'Substack', value: 'askesisproject.substack.com' },
  ],
};

export const contactForm = {
  fields: [
    { label: 'Name', name: 'name', type: 'text' },
    { label: 'Email', name: 'email', type: 'email' },
    { label: 'What are you working on?', name: 'message', type: 'textarea' },
  ],
  submitLabel: 'Send',
  successMessage: "Sent — thank you. I'll be in touch.",
  errorMessage: 'Something went wrong. Please try emailing directly.',
  formspreeId: 'xlgyrgag',
};
