import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText, Calendar, Mail } from 'lucide-react'

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('terms')

  const sections = [
    { id: 'terms', title: 'Terms of Service', icon: FileText },
    { id: 'privacy', title: 'Privacy Policy', icon: FileText },
    { id: 'cookies', title: 'Cookie Policy', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-orange-950">
      {/* Header */}
      <div className="bg-white dark:bg-orange-900 shadow-sm border-b border-orange-200 dark:border-orange-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200 mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back to Home
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-orange-900 dark:text-orange-100">
            Legal Information
          </h1>
          <p className="text-orange-700 dark:text-orange-300 mt-2">
            Our terms, privacy policy, and other legal documents
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-4 sticky top-8">
              <nav className="space-y-2">
                {sections.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center px-3 py-2 rounded-md text-left transition-colors ${
                      activeSection === id
                        ? 'bg-orange-100 text-orange-900 dark:bg-orange-800 dark:text-orange-100'
                        : 'text-orange-700 hover:bg-orange-50 dark:text-orange-300 dark:hover:bg-orange-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-3" />
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-3/4">
            <div className="bg-white dark:bg-orange-900 rounded-lg shadow-sm border border-orange-200 dark:border-orange-800 p-8">
              {/* Terms of Service */}
              {activeSection === 'terms' && (
                <div className="prose prose-orange max-w-none dark:prose-invert">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 m-0">
                      Terms of Service
                    </h2>
                  </div>
                  
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 mb-8">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last updated: January 1, 2024
                  </div>

                  <div className="space-y-6 text-orange-800 dark:text-orange-200">
                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        1. Acceptance of Terms
                      </h3>
                      <p>
                        By accessing and using Bellyfed, you accept and agree to be bound by the terms 
                        and provision of this agreement. If you do not agree to abide by the above, 
                        please do not use this service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        2. Use License
                      </h3>
                      <p>
                        Permission is granted to temporarily download one copy of Bellyfed per device 
                        for personal, non-commercial transitory viewing only. This is the grant of a 
                        license, not a transfer of title, and under this license you may not:
                      </p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>modify or copy the materials</li>
                        <li>use the materials for any commercial purpose or for any public display</li>
                        <li>attempt to reverse engineer any software contained on the website</li>
                        <li>remove any copyright or other proprietary notations from the materials</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        3. User Content
                      </h3>
                      <p>
                        Users may post reviews, photos, and other content. By posting content, you grant 
                        Bellyfed a non-exclusive, royalty-free, perpetual, and worldwide license to use, 
                        modify, and display such content in connection with the service.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        4. Privacy Policy
                      </h3>
                      <p>
                        Your privacy is important to us. Please review our Privacy Policy, which also 
                        governs your use of the service, to understand our practices.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        5. Prohibited Uses
                      </h3>
                      <p>You may not use our service:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>For any unlawful purpose or to solicit others to unlawful acts</li>
                        <li>To violate any international, federal, provincial, or state regulations or laws</li>
                        <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                        <li>To submit false or misleading information</li>
                        <li>To upload or transmit viruses or any other type of malicious code</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        6. Disclaimer
                      </h3>
                      <p>
                        The information on this website is provided on an 'as is' basis. To the fullest 
                        extent permitted by law, this Company excludes all representations, warranties, 
                        conditions and terms relating to our website and the use of this website.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        7. Contact Information
                      </h3>
                      <p>
                        If you have any questions about these Terms of Service, please contact us at:
                      </p>
                      <div className="flex items-center mt-2">
                        <Mail className="w-4 h-4 text-orange-500 mr-2" />
                        <a 
                          href="mailto:legal@bellyfed.com" 
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                        >
                          legal@bellyfed.com
                        </a>
                      </div>
                    </section>
                  </div>
                </div>
              )}

              {/* Privacy Policy */}
              {activeSection === 'privacy' && (
                <div className="prose prose-orange max-w-none dark:prose-invert">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 m-0">
                      Privacy Policy
                    </h2>
                  </div>
                  
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 mb-8">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last updated: January 1, 2024
                  </div>

                  <div className="space-y-6 text-orange-800 dark:text-orange-200">
                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        Information We Collect
                      </h3>
                      <p>
                        We collect information you provide directly to us, such as when you create an 
                        account, post reviews, or contact us for support.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        How We Use Your Information
                      </h3>
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices and support messages</li>
                        <li>Communicate with you about products, services, and events</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        Information Sharing
                      </h3>
                      <p>
                        We do not sell, trade, or otherwise transfer your personal information to third 
                        parties without your consent, except as described in this policy.
                      </p>
                    </section>
                  </div>
                </div>
              )}

              {/* Cookie Policy */}
              {activeSection === 'cookies' && (
                <div className="prose prose-orange max-w-none dark:prose-invert">
                  <div className="flex items-center mb-6">
                    <FileText className="w-6 h-6 text-orange-500 mr-3" />
                    <h2 className="text-2xl font-bold text-orange-900 dark:text-orange-100 m-0">
                      Cookie Policy
                    </h2>
                  </div>
                  
                  <div className="flex items-center text-sm text-orange-600 dark:text-orange-400 mb-8">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last updated: January 1, 2024
                  </div>

                  <div className="space-y-6 text-orange-800 dark:text-orange-200">
                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        What Are Cookies
                      </h3>
                      <p>
                        Cookies are small text files that are stored on your device when you visit our 
                        website. They help us provide you with a better experience.
                      </p>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        How We Use Cookies
                      </h3>
                      <p>We use cookies to:</p>
                      <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Keep you signed in</li>
                        <li>Remember your preferences</li>
                        <li>Analyze how you use our website</li>
                        <li>Improve our services</li>
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-3">
                        Managing Cookies
                      </h3>
                      <p>
                        You can control and manage cookies in your browser settings. Please note that 
                        removing or blocking cookies may impact your user experience.
                      </p>
                    </section>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
