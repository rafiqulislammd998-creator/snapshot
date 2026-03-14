// ============================================
// BLOG POSTS DATA - blog.js
// Separate file for easy blog management
// ============================================

const blogPosts = [
    {
    id: 1,
    title: "PPL স্প্লিট: নতুনদের জন্য সহজ ও কার্যকর জিম রুটিন 💪",
    excerpt: `PPL কি?
PPL মানে Push, Pull, Legs। এটা একটি জিম স্প্লিট যেখানে তোমার সপ্তাহের ওয়ার্কআউটকে তিন ভাগে ভাগ করা হয়:
Push (ঠেলা) – বুক, কাঁধ, এবং ট্রাইসেপসের জন্য
Pull (টানা) – পিঠ এবং বাইসেপসের জন্য
Legs (পা) – পায়ের মাংসপেশি এবং হ্যামস্ট্রিং
এই স্প্লিট দিয়ে প্রতিটি মাংসপেশি ঠিক সময়ে বিশ্রাম পায়, তাই বৃদ্ধি (growth) এবং শক্তি (strength) দুটোই ভালো হয়।`,
    content: `
        <p>PPL মানে Push, Pull, Legs। এটি একটি সহজ এবং কার্যকর জিম স্প্লিট। নতুনরা এই রুটিন দিয়ে প্রতিটি মাসল গ্রুপ ঠিক সময়ে কাজ করতে পারে এবং পর্যাপ্ত বিশ্রাম পায়।</p>
        
        <h2>PPL কিভাবে কাজ করে?</h2>
        <p>তোমার সপ্তাহের ওয়ার্কআউটকে তিন ভাগে ভাগ করা হয়:</p>
        <ul>
            <li><strong>Push (ঠেলা)</strong> – বুক, কাঁধ, এবং ট্রাইসেপস</li>
            <li><strong>Pull (টানা)</strong> – পিঠ এবং বাইসেপস</li>
            <li><strong>Legs (পা)</strong> – পায়ের মাসল এবং হ্যামস্ট্রিং</li>
        </ul>
        <p>এভাবে প্রতিটি মাসল গ্রুপ পর্যাপ্ত বিশ্রাম পায় এবং শক্তি ও মাসল বৃদ্ধি হয়।</p>
        
        <h2>নতুনদের জন্য কেন ভালো?</h2>
        <ul>
            <li><strong>সহজ ও সরল:</strong> সপ্তাহে মাত্র তিন ধরনের দিন।</li>
            <li><strong>পূর্ণ দেহের কভারেজ:</strong> সব মাসল নিয়মিত কাজ করে।</li>
            <li><strong>ফাস্ট রেজাল্ট:</strong> সঠিকভাবে করলে শক্তি এবং মাসল দ্রুত বৃদ্ধি পায়।</li>
            <li><strong>ফ্লেক্সিবল:</strong> সপ্তাহে 3 থেকে 6 দিন ওয়ার্কআউট করা যায়।</li>
        </ul>
        
        <h2>সাধারণ সপ্তাহের রুটিন</h2>
        <p>উদাহরণস্বরূপ:</p>
        <ul>
            <li>সোমবার – Push</li>
            <li>মঙ্গলবার – Pull</li>
            <li>বুধবার – Legs</li>
            <li>বৃহস্পতিবার – Push</li>
            <li>শুক্রবার – Pull</li>
            <li>শনিবার – Legs</li>
            <li>রবিবার – বিশ্রাম</li>
        </ul>
        
        <p>হালকা ওজন দিয়ে শুরু করো এবং সঠিক ফর্মে ফোকাস করো। এটি নতুনদের জন্য একটি আদর্শ স্প্লিট।</p>
        
        <h2>উপসংহার</h2>
        <p>PPL স্প্লিট নতুনদের জন্য সহজ, কার্যকর এবং ফ্লেক্সিবল। এটি তোমার মাসল বাড়াতে সাহায্য করবে এবং ওয়ার্কআউটের অভিজ্ঞতাও মজার করবে।</p>
    `,
    category: "fitness",
    image: "https://res.cloudinary.com/dgeukkdc9/image/upload/v1773484528/images_1_lewc3o.jpg",
    author: {
        name: "Redwan",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
        role: "Fitness Blogger"
    },
    date: "2026-03-14",
    readTime: "5 min read",
    views: "5.2K",
    likes: 420,
    featured: true,
    tags: ["PPL", "Gym", "Workout", "Beginner"]
},
    {
        id: 7,
        title: "Remote Work Revolution: Building Productive Home Offices",
        excerpt: "Create a home office that boosts productivity and maintains work-life balance. Tips for ergonomics, technology, and mental health.",
        content: `
            <p>The shift to remote work has transformed how millions of people approach their careers. But working from home effectively requires more than just a laptop and a kitchen table. Here's how to create a home office that works for you.</p>
            
            <h2>Designing Your Space</h2>
            <p>Your workspace should be dedicated, comfortable, and free from distractions. If possible, choose a room with a door you can close at the end of the day. This physical separation helps maintain work-life boundaries.</p>
            
            <h2>Ergonomics Matter</h2>
            <p>Invest in a quality chair that supports your lower back. Position your monitor at eye level to avoid neck strain. Consider a standing desk or converter to vary your position throughout the day.</p>
            
            <h2>Technology Setup</h2>
            <p>Reliable internet is non-negotiable. Consider upgrading your connection if you experience frequent disruptions. Good lighting, especially for video calls, makes a significant difference in how you present yourself.</p>
            
            <h2>Maintaining Routine</h2>
            <p>Without the structure of an office, it's easy to blur the lines between work and personal time. Establish clear start and end times. Take regular breaks. Get dressed—even if it's just into comfortable clothes.</p>
            
            <h2>Combating Isolation</h2>
            <p>Remote work can be isolating. Make an effort to connect with colleagues through video calls, not just chat. Consider working from a coffee shop or co-working space occasionally for a change of scenery.</p>
        `,
        category: "technology",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800&h=500&fit=crop",
        author: {
            name: "Jennifer Walsh",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
            role: "Remote Work Consultant"
        },
        date: "2024-02-26",
        readTime: "8 min read",
        views: "14.1K",
        likes: 1100,
        featured: false,
        tags: ["Remote Work", "Productivity", "Home Office", "Work Life Balance"]
    },
    {
        id: 8,
        title: "Mindful Photography: Seeing the World with Fresh Eyes",
        excerpt: "Learn how mindfulness can transform your photography practice. Discover techniques for being present and capturing authentic moments.",
        content: `
            <p>Photography is often seen as a technical skill—understanding aperture, shutter speed, and composition. But at its heart, photography is about seeing. And seeing requires presence.</p>
            
            <h2>The Mindful Approach</h2>
            <p>Mindful photography is about slowing down and truly observing your surroundings. It's about being present in the moment rather than rushing to capture it. This approach leads to more meaningful, authentic images.</p>
            
            <h2>Practical Techniques</h2>
            <h3>1. Breathe Before You Shoot</h3>
            <p>Take a deep breath before raising your camera. This simple act centers you and prepares you to observe.</p>
            
            <h3>2. Look Without Labels</h3>
            <p>Try to see objects without naming them. Notice shapes, colors, and textures rather than "tree" or "building."</p>
            
            <h3>3. Embrace Imperfection</h3>
            <p>Not every photo needs to be technically perfect. Sometimes the most powerful images are those that capture genuine emotion, even if they're slightly out of focus.</p>
            
            <h2>The Benefits Beyond Photography</h2>
            <p>Practicing mindful photography extends beyond your camera work. It trains you to be more observant and present in everyday life, leading to greater appreciation of the world around you.</p>
            
            <blockquote>"To me, photography is an art of observation. It's about finding something interesting in an ordinary place... I've found it has little to do with the things you see and everything to do with the way you see them." — Elliott Erwitt</blockquote>
        `,
        category: "creativity",
        image: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&h=500&fit=crop",
        author: {
            name: "Michael Brooks",
            avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=100&h=100&fit=crop",
            role: "Photography Instructor"
        },
        date: "2024-02-24",
        readTime: "6 min read",
        views: "6.8K",
        likes: 487,
        featured: false,
        tags: ["Photography", "Mindfulness", "Creativity", "Art"]
    },
    {
        id: 9,
        title: "The Science of Sleep: Optimizing Your Rest for Better Days",
        excerpt: "Understand the science behind quality sleep and learn evidence-based strategies for improving your nightly rest and daily energy.",
        content: `
            <p>Sleep is not a luxury—it's a biological necessity. Yet millions of people struggle to get the quality rest they need. Understanding the science of sleep can help you optimize your nights for better days.</p>
            
            <h2>Why Sleep Matters</h2>
            <p>During sleep, your brain consolidates memories, clears toxins, and prepares for the next day. Your body repairs tissues, regulates hormones, and strengthens your immune system. Poor sleep affects every aspect of health.</p>
            
            <h2>The Sleep Cycle</h2>
            <p>Sleep occurs in cycles of about 90 minutes, moving through light sleep, deep sleep, and REM sleep. Each stage serves different functions, and disrupting these cycles leaves you feeling groggy even after hours in bed.</p>
            
            <h2>Optimizing Your Sleep Environment</h2>
            <ul>
                <li><strong>Temperature:</strong> Keep your bedroom cool (65-68°F is ideal).</li>
                <li><strong>Darkness:</strong> Use blackout curtains or an eye mask to block light.</li>
                <li><strong>Quiet:</strong> Consider white noise if you live in a noisy area.</li>
                <li><strong>Comfort:</strong> Invest in a quality mattress and pillows.</li>
            </ul>
            
            <h2>Sleep Hygiene Habits</h2>
            <p>Consistent sleep and wake times regulate your body's internal clock. Avoid screens for at least an hour before bed—the blue light suppresses melatonin production. Limit caffeine after noon and alcohol before bed.</p>
            
            <h2>When to Seek Help</h2>
            <p>If you consistently struggle with sleep despite good habits, consult a healthcare provider. Sleep disorders like sleep apnea are common and treatable.</p>
        `,
        category: "lifestyle",
        image: "https://images.unsplash.com/photo-1515894203077-9cd36032142f?w=800&h=500&fit=crop",
        author: {
            name: "Dr. Rachel Chen",
            avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&h=100&fit=crop",
            role: "Sleep Specialist"
        },
        date: "2024-02-22",
        readTime: "9 min read",
        views: "18.5K",
        likes: 1500,
        featured: false,
        tags: ["Sleep", "Health", "Wellness", "Science"]
    },
    {
        id: 10,
        title: "Resilience: Finding Beauty in Hardship",
        excerpt: "Like flowers pushing through barbed wire, we too can grow through difficult circumstances. Discover the psychology of resilience.",
        content: `
            <p>Life often feels like a field of barbed wire—sharp, restrictive, painful. Yet somehow, beauty finds a way to bloom.</p>
            
            <h2>The Nature of Resilience</h2>
            <p>Resilience isn't about avoiding hardship. It's about growing through it. Just as those orange flowers push through metal barriers, we too can find paths forward when obstacles seem insurmountable.</p>
            
            <h2>Building Mental Toughness</h2>
            <ul>
                <li><strong>Acceptance:</strong> Acknowledge the difficulty without judgment</li>
                <li><strong>Connection:</strong> Reach out to others who support your growth</li>
                <li><strong>Purpose:</strong> Find meaning even in suffering</li>
                <li><strong>Adaptation:</strong> Bend without breaking</li>
            </ul>
            
            <blockquote>"The human capacity for burden is like bamboo—far more flexible than you'd ever believe at first glance." — Jodi Picoult</blockquote>
            
            <h2>Your Turn to Bloom</h2>
            <p>Whatever barriers you're facing today, remember: growth is always possible. The conditions don't have to be perfect. You just need to push through.</p>
        `,
        category: "Facebook",
        image: "https://images.unsplash.com/photo-1594670297948-e910d5964979?w=800&h=500&fit=crop",
        author: {
            name: "Your Name",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
            role: "Wellness Writer"
        },
        date: "2026-03-14",
        readTime: "6 min read",
        views: "250",
        likes: 45,
        featured: true,
        tags: ["Resilience", "Mental Health", "Growth", "Inspiration"]
    }
];

// Export for use in other files (if using modules)
// If using regular script tags, this variable is globally available
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { blogPosts };
}
