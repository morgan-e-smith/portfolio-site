// Testimonials, exactly as written in the build brief (section 12).
// Attribution is title and company only. No names, anywhere.
// Open decision: relationship tags ("direct report", "my manager"). Default: title only.

export interface Quote { text: string; attribution: string }

const q = (text: string, attribution: string): Quote => ({ text, attribution });

export const quotes = {
  home: [
    q("Morgan is 100% performing at a level above her current role.", "Senior Manager, Account Experience, Accenture"),
    q("She has the skills and demeanor much greater than her career level.", "Senior Manager, Copywriting, Accenture"),
  ],
  aiRecognition: [
    q("…leading the shaping and delivery of the Q4 incentive contest. Great seeing you proactively take the lead… and do a wonderful job covering all the details.", "Associate Director, Marketing Reinvention and Growth, Accenture"),
  ],
  aiEnablementHub: [
    q("It’s clear the training resonated with participants and helped build greater confidence in applying Claude in their day-to-day work.", "Associate Director, Marketing Reinvention and Growth, Accenture"),
    q("One of my ‘phone a friend’ people… grateful for her ability to figure this world of AI out with me.", "Senior Manager, Creative AI Technology, Accenture"),
  ],
  aboutWhatPeopleSay: [
    q("I recommend her strongly for interesting and challenging assignments.", "Managing Director, Accenture"),
    q("Absorbing stress and diffusing serenity, like a true ship captain.", "Managing Director, Marketing, Accenture"),
    q("Her strategic acumen, combined with her operational knowledge, makes her an asset to any team.", "Associate Director, Marketing Strategy, Accenture"),
  ],
  aboutHowILead: [
    q("Morgan demonstrates leadership DNA.", "Senior Manager, Digital Strategy, Accenture"),
    q("You never miss opportunities to acknowledge team members for their contributions, which is why people feel genuinely invested in making your projects a success.", "Digital Execution Specialist, Accenture"),
    q("She’s clear, patient and always readily available… all the qualities you want in a manager.", "Manager, Copywriting, Accenture"),
  ],
  aboutCareerArc: [
    q("She has dug into learning AEM / authoring which is beyond what we would typically expect from a business partner.", "Senior Product Manager, Accenture"),
    q("On more than one occasion been the sole reason the project met certain delivery deadlines.", "UX Specialist, Accenture"),
    q("Her introduction of the ‘product approach’ was particularly noteworthy.", "Manager, Digital Strategy, Accenture"),
    q("She ‘gets’ the strategy… and can articulate back to even the highest levels of leadership.", "Senior Manager, Digital Strategy, Accenture"),
  ],
};
