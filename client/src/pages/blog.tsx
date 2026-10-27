import { Heart } from "lucide-react";
import Footer from "@/components/footer";

export default function BlogPage() {
  const blogPosts = [
    {
      id: 1,
      title: "Privacy-First Relationship Management: A Modern Approach",
      excerpt: "Learn how to maintain meaningful connections while protecting your personal data with advanced encryption and privacy controls.",
      author: "Sarah Chen",
      date: "Mar 15, 2024",
      image: "/api/placeholder/400/250",
      category: "Privacy"
    },
    {
      id: 2,
      title: "Building Authentic Connections in the Digital Age",
      excerpt: "Discover strategies for creating genuine relationships while managing multiple connections with discretion and respect.",
      author: "Marcus Johnson",
      date: "Mar 10, 2024",
      image: "/api/placeholder/400/250",
      category: "Relationships"
    },
    {
      id: 3,
      title: "The Art of Remembering: Timeline Management Tips",
      excerpt: "Master the skill of tracking important moments and conversations to strengthen your personal connections over time.",
      author: "Emma Rodriguez",
      date: "Feb 28, 2024",
      image: "/api/placeholder/400/250",
      category: "Organization"
    },
    {
      id: 4,
      title: "Security Best Practices for Personal Data",
      excerpt: "Essential security measures to protect your relationship data and maintain complete confidentiality in personal management.",
      author: "David Kim",
      date: "Feb 20, 2024",
      image: "/api/placeholder/400/250",
      category: "Security"
    },
    {
      id: 5,
      title: "Smart Reminders: Never Miss Important Moments",
      excerpt: "How to set up intelligent notifications that help you stay connected without overwhelming your daily routine.",
      author: "Lisa Thompson",
      date: "Feb 12, 2024",
      image: "/api/placeholder/400/250",
      category: "Productivity"
    },
    {
      id: 6,
      title: "Emotional Intelligence in Modern Dating",
      excerpt: "Understanding emotional patterns and communication styles to build deeper, more meaningful romantic connections.",
      author: "Alex Foster",
      date: "Feb 5, 2024",
      image: "/api/placeholder/400/250",
      category: "Psychology"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-indigo-900/20">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-pink-100 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <a href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                VelvetLog
              </span>
            </a>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Home
              </a>
              <a href="/about" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                About
              </a>
              <a href="/solutions" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Solutions
              </a>
              <a href="/pricing" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Pricing
              </a>
              <a href="/faq" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                FAQ
              </a>
              <a href="/contact" className="text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
                Contact
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Learn how to manage your relationships with our expert advice on privacy, 
            security, and meaningful connections.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <Heart className="w-8 h-8 text-white" />
                  </div>
                </div>
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-800/90 text-xs font-medium text-pink-600 dark:text-pink-400 rounded-full">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full mr-2" />
                  <span className="font-medium mr-2">{post.author}</span>
                  <span>•</span>
                  <span className="ml-2">{post.date}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {post.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {post.excerpt}
                </p>

                {/* Read More */}
                <div className="mt-4 flex items-center text-pink-600 dark:text-pink-400 text-sm font-medium group-hover:text-pink-700 dark:group-hover:text-pink-300 transition-colors">
                  <span>Read article</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-20 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Stay updated with our latest insights
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Get exclusive tips on relationship management, privacy best practices, and 
              the latest VelvetLog features delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80 dark:bg-gray-700/80 text-gray-900 dark:text-white"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-medium rounded-lg transition-all">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}