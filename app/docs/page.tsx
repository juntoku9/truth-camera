import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpenIcon, ArrowUpRightIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Docs',
  description: 'Vision, principles, and technical notes for Truth Camera.',
};

export default function DocsPage() {
  return (
    <div className="min-h-screen tc-hero relative">
      <div className="relative container mx-auto px-4 py-8 sm:py-14">
        {/* Hero */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
            <BookOpenIcon className="h-4 w-4" /> Docs
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold text-white">Truth Camera Documentation</h1>
          <p className="mt-3 text-gray-300 max-w-2xl mx-auto">
            Vision, principles, and implementation details that power authentic image capture and verification.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-6 sm:gap-8 max-w-6xl mx-auto">
          {/* Content */}
          <main className="space-y-6 sm:space-y-8">
            {/* Abstract */}
            <section id="abstract" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Abstract</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-3">
                <p>
                  Truth Camera establishes cryptographic proof of photo authenticity at the moment of capture using Coinbase Developer Platform tools and Base blockchain infrastructure. By enforcing camera-only capture flows and instantly anchoring cryptographic fingerprints on-chain, we create tamper-resistant verification in an era where AI-generated imagery threatens visual media trust.
                </p>
                <p className="text-white/90">
                  <span className="font-medium">Key Innovation:</span> Sub-penny verification costs via Base L2, signed with user wallets, creating portable and globally verifiable proof-of-capture records.
                </p>
              </div>
            </section>

            {/* 1. Introduction */}
            <section id="introduction" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">1. Introduction</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-4">
                <div>
                  <h3 className="text-white font-medium mb-1">The AI Trust Crisis</h3>
                  <p>
                    Generative AI has reached a tipping point where synthetic images are indistinguishable from authentic photography. Traditional verification methods rely on post-hoc analysis of uploaded content, creating attack vectors for sophisticated manipulation. Most current solutions attempt to verify images after they've already been processed, edited, or manipulated, leaving critical windows for deception.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-medium mb-1">Our Solution</h3>
                  <p>
                    Truth Camera shifts verification to the point of capture, combining camera-only workflows with instant blockchain anchoring. Users capture photos directly in our app, we compute SHA-256 hashes in the browser, and immediately submit proof to Base blockchain. This eliminates the manipulation window that plagues traditional verification approaches while leveraging Coinbase's infrastructure for seamless user experience.
                  </p>
                </div>
              </div>
            </section>

            {/* 2. Technical Architecture */}
            <section id="technical-architecture" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">2. Technical Architecture</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="current-stack">
                  <h3 className="text-white font-medium mb-1">2.1 Current Implementation Stack</h3>
                  <p>
                    Our hackathon MVP leverages a modern web stack optimized for both performance and user experience. The frontend runs on Next.js with React, deployed as a Progressive Web App to ensure cross-platform compatibility. For wallet integration, we use Privy authentication combined with support for injected wallets including Coinbase Wallet via EIP-1193 standards.
                  </p>
                  <p className="mt-2">
                    The blockchain layer operates entirely on Base Mainnet and testnets, utilizing custom Solidity smart contracts for minimal on-chain storage. Our approach prioritizes cost efficiency by storing only essential proof data on-chain while maintaining cryptographic integrity. We use Ethers v6 for blockchain interactions and the Web Crypto API for SHA-256 hashing directly in the browser.
                  </p>
                  <p className="mt-2">
                    Looking ahead, our roadmap includes integration with Coinbase Onramp API for frictionless funding, AgentKit for AI-powered analysis, and React Native mobile applications for enhanced camera access.
                  </p>
                </div>
                <div id="data-architecture">
                  <h3 className="text-white font-medium mb-1">2.2 Data Architecture</h3>
                  <p>
                    Our smart contract implements a minimal registry approach, mapping image hashes to proof records. The core mapping structure stores bytes32 imageHash to a struct containing submitter address and timestamp. When proofs are submitted, we emit ProofSubmitted events containing the hash, submitter, and timestamp for off-chain indexing.
                  </p>
                  <p className="mt-2">
                    This minimalist approach keeps gas costs predictable while maintaining cryptographic integrity. Advanced metadata like GPS coordinates, EXIF data, and cryptographic signatures are planned for future iterations but kept off-chain to optimize for cost and privacy.
                  </p>
                </div>
                <div id="verification-workflow">
                  <h3 className="text-white font-medium mb-1">2.3 Verification Workflow</h3>
                  <p>
                    The user experience centers around immediate proof generation. Users open Truth Camera, connect their wallet through Privy or injected providers, and capture photos directly from their device camera. The app prevents gallery uploads entirely, ensuring only fresh captures can be verified.
                  </p>
                  <p className="mt-2">
                    Upon capture, we compute the SHA-256 hash of the image file bytes directly in the browser using the Web Crypto API. This hash becomes the cryptographic fingerprint that gets submitted to our Base smart contract. Users receive immediate confirmation with transaction links to Basescan for transparency.
                  </p>
                  <p className="mt-2">
                    Verification works by allowing anyone to drag and drop an image into our interface. We re-hash the file and query our smart contract to check if a matching proof exists on-chain. Results display instantly with block explorer links for independent verification.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Coinbase CDP Integration Benefits */}
            <section id="coinbase-cdp" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">3. Coinbase CDP Integration Benefits</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="base-advantages">
                  <h3 className="text-white font-medium mb-1">3.1 Base Blockchain Advantages</h3>
                  <p>
                    Photo verification requires sub-penny transaction costs to achieve global scale. Base's L2 architecture enables verification at approximately $0.001 per photo versus $10+ on Ethereum mainnet. This cost efficiency transforms verification from an expensive, occasional process into something that can be applied to every photo capture.
                  </p>
                  <p className="mt-2">
                    The speed advantage is equally important. Base's fast confirmation times enable real-time verification workflows where users receive proof certificates within seconds of capture. This immediacy is crucial for breaking news, insurance claims, and other time-sensitive use cases.
                  </p>
                </div>
                <div id="coinbase-wallet">
                  <h3 className="text-white font-medium mb-1">3.2 Coinbase Wallet Integration</h3>
                  <p>
                    Our current implementation supports Coinbase Wallet through standard injected provider interfaces, with dedicated SDK integration planned for enhanced user experience. Coinbase Wallet provides cryptographic proof of photographer identity without requiring personal information disclosure, maintaining privacy while establishing accountability.
                  </p>
                  <p className="mt-2">
                    The recovery and cross-platform features of Coinbase Wallet reduce onboarding friction compared to traditional Web3 wallets, making Truth Camera accessible to mainstream users who aren't crypto-native.
                  </p>
                </div>
                <div id="onramp">
                  <h3 className="text-white font-medium mb-1">3.3 Planned Onramp Integration</h3>
                  <p>
                    Future iterations will integrate Coinbase Onramp API to enable credit card funding for verification fees. This removes the final barrier for non-crypto users who want to verify photos but don't hold cryptocurrency. Global access becomes possible as international users can participate without existing crypto holdings or complex exchange processes.
                  </p>
                </div>
              </div>
            </section>


            {/* 4. Security Model */}
            <section id="security-model" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">4. Security Model</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="attack-vectors">
                  <h3 className="text-white font-medium mb-1">4.1 Attack Vector Analysis</h3>
                  <p>
                    Our camera-only capture policy prevents the most common attack vector: uploading AI-generated images disguised as authentic photos. By requiring direct camera capture, we eliminate the possibility of users submitting synthetic content from external sources.
                  </p>
                  <p className="mt-2">
                    Immediate hashing after capture prevents post-processing manipulation that could alter the image after the "authentic moment" has passed. Traditional verification systems that allow uploads have already lost the battle by the time they begin analysis.
                  </p>
                  <p className="mt-2">
                    Blockchain anchoring prevents timestamp spoofing, a common vulnerability in metadata-based verification systems. Block timestamps provide immutable temporal proof that can't be backdated or falsified.
                  </p>
                  <p className="mt-2">
                    Wallet-bound identity creates accountability without sacrificing privacy. Each proof is cryptographically signed by the photographer's wallet, establishing provenance without requiring personal information disclosure.
                  </p>
                </div>
                <div id="remaining-challenges">
                  <h3 className="text-white font-medium mb-1">4.2 Remaining Challenges</h3>
                  <p>
                    Device-level spoofing represents the most sophisticated remaining attack vector, requiring rooted devices and significant technical expertise. Physical scene manipulation before capture remains outside our scope, as we prove computational integrity rather than semantic truth.
                  </p>
                  <p className="mt-2">
                    Our trust model is explicit: we prove that specific image bytes existed at a specific time, submitted by a specific wallet address. We don't claim to prove that the photographed scene represents reality, only that these particular pixels were captured and recorded immutably.
                  </p>
                </div>
              </div>
            </section>

            {/* 5. Target Markets & Use Cases */}
            <section id="target-markets" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">5. Target Markets & Use Cases</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="journalism-media">
                  <h3 className="text-white font-medium mb-1">5.1 Journalism & Media</h3>
                  <p>
                    Field reporters can establish photo authenticity in real-time, providing news organizations with verifiable user-generated content. This capability becomes crucial for breaking news situations where traditional verification methods are too slow or unavailable.
                  </p>
                </div>
                <div id="insurance-legal">
                  <h3 className="text-white font-medium mb-1">5.2 Insurance & Legal</h3>
                  <p>
                    Insurance adjusters can document damage with timestamped, tamper-proof evidence that expedites claim processing. Legal professionals gain access to verifiable evidence collection with clear chain of custody maintained through cryptographic proof.
                  </p>
                </div>
                <div id="ecommerce-marketplaces">
                  <h3 className="text-white font-medium mb-1">5.3 E-commerce & Marketplaces</h3>
                  <p>
                    Sellers can prove their product photos are original rather than stock images or competitor theft. This builds marketplace trust and reduces fraud while giving authentic sellers a competitive advantage.
                  </p>
                </div>
                <div id="social-platforms">
                  <h3 className="text-white font-medium mb-1">5.4 Social Media & Content Platforms</h3>
                  <p>
                    Platforms can offer "verified authentic" content badges to combat deepfakes and AI-generated misinformation. Content creators gain tools to prove their work's authenticity, essential for maintaining audience trust and brand partnerships.
                  </p>
                </div>
                <div id="implementation-examples">
                  <h3 className="text-white font-medium mb-1">5.5 Implementation Examples</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <span className="font-medium text-white">Breaking News Verification:</span> Reporter captures protest photo → Instant Base proof → News desk verifies authenticity → Publication with verification badge
                    </li>
                    <li>
                      <span className="font-medium text-white">Insurance Claims:</span> Driver captures accident damage → Wallet-signed proof → Adjuster verifies on-chain → Expedited claim processing
                    </li>
                    <li>
                      <span className="font-medium text-white">Social Media Trust:</span> User captures viral moment → Truth Camera proof → Platform displays verification badge → Audience trusts authenticity → Reduced spread of fake content
                    </li>
                    <li>
                      <span className="font-medium text-white">Content Creator Verification:</span> Influencer documents behind-the-scenes content → Blockchain proof → Followers verify authenticity → Enhanced creator credibility and brand partnerships
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 6. User Experience Design */}
            <section id="user-experience" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">6. User Experience Design</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="capture-flow">
                  <h3 className="text-white font-medium mb-1">6.1 Capture Flow</h3>
                  <p>
                    The interface prioritizes simplicity over technical complexity. Users open Truth Camera, connect their wallet through familiar flows, and use a standard camera interface to capture photos. The blockchain complexity happens invisibly, with users receiving simple confirmation that their proof has been recorded.
                  </p>
                </div>
                <div id="verification-interface">
                  <h3 className="text-white font-medium mb-1">6.2 Verification Interface</h3>
                  <p>
                    Verification works through intuitive drag-and-drop interaction. Users drop any image file into the interface and receive immediate results showing whether a proof exists, when it was created, and who submitted it. Block explorer links provide transparency for technical users while remaining optional for casual verification.
                  </p>
                  <p className="mt-2">
                    Our design philosophy eliminates blockchain jargon in favor of plain language that explains the verification process in terms users already understand.
                  </p>
                </div>
              </div>
            </section>

             {/* 7. Technical Innovation */}
             <section id="technical-innovation" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">7. Technical Innovation</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="near-term-enhancements">
                  <h3 className="text-white font-medium mb-1">7.1 Near-Term Enhancements</h3>
                  <p>
                    Our roadmap includes wallet-signed payloads that enable richer metadata storage off-chain while maintaining cost efficiency. Device attestation capabilities will add platform-specific verification signals, GPS coordinates, and EXIF data capture for enhanced proof strength.
                  </p>
                  <p className="mt-2">
                    Base optimization focuses on event-first indexing patterns, minimal on-chain storage, and batching capabilities for high-volume users like news organizations or enterprise customers.
                  </p>
                </div>
                <div id="advanced-features">
                  <h3 className="text-white font-medium mb-1">7.2 Advanced Features</h3>
                  <p>
                    Future iterations will integrate AgentKit for AI-powered confidence scoring that analyzes multiple signals to assess authenticity likelihood. This adds interpretive layers above the core cryptographic proof while maintaining the immutable foundation.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. Competitive Landscape */}
            <section id="competitive-landscape" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">8. Competitive Landscape</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-3">
                <p>
                  Traditional approaches like C2PA metadata standards, forensic analysis tools, and watermarking systems all operate post-hoc with inherent vulnerabilities. C2PA can be stripped, forensics are expensive and slow, and watermarks can be removed or don't prove authenticity.
                </p>
                <p>
                  Truth Camera's point-of-capture approach with blockchain anchoring creates verification that's immediate, cost-effective, and tamper-resistant. Our user-friendly interface makes enterprise-grade verification accessible to individual users rather than requiring specialized technical knowledge.
                </p>
              </div>
            </section>

            {/* 9. Success Metrics */}
            <section id="success-metrics" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-orange">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-neon-orange)] to-[var(--tc-neon-orange-2)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">9. Success Metrics</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="technical-performance">
                  <h3 className="text-white font-medium mb-1">9.1 Technical Performance</h3>
                  <p>
                    Our targets include sub-5-second latency from capture to proof completion, greater than 99% verification success rate for unmodified images, and maintaining costs below $0.01 per verification on Base.
                  </p>
                </div>
                <div id="adoption-indicators">
                  <h3 className="text-white font-medium mb-1">9.2 Adoption Indicators</h3>
                  <p>
                    Success metrics focus on daily proof volume, third-party verification queries, and user retention rates. Platform integrations that recognize Truth Camera proofs indicate growing market acceptance of our verification standard.
                  </p>
                </div>
              </div>
            </section>

            {/* 10. Implementation Roadmap */}
            <section id="implementation-roadmap" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">10. Implementation Roadmap</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-5">
                <div id="hackathon-mvp">
                  <h3 className="text-white font-medium mb-1">10.1 Current Hackathon MVP</h3>
                  <p>
                    Our demonstration includes functional camera capture with in-browser SHA-256 computation, deployed smart contracts on Base with submit and verify functions, wallet connection through Privy and injected providers including Coinbase Wallet, and basic verification interface with Basescan integration for transparency.
                  </p>
                </div>
                <div id="near-term-development">
                  <h3 className="text-white font-medium mb-1">10.2 Near-Term Development</h3>
                  <p>
                    Q1-Q2 2025 priorities include dedicated Coinbase Wallet SDK integration, Onramp API for seamless funding, signed payload architecture for metadata storage, batch processing capabilities, and social platform integrations starting with Farcaster.
                  </p>
                </div>
                <div id="long-term-vision">
                  <h3 className="text-white font-medium mb-1">10.3 Long-Term Vision</h3>
                  <p>
                    We envision ubiquitous verification becoming standard across camera-enabled devices, establishing Truth Camera proofs as industry-standard provenance that platforms automatically recognize and users expect for authentic content.
                  </p>
                </div>
              </div>
            </section>

            

            <section id="conclusion" className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-6 sm:p-8 tc-glow-blue">
              <div className="h-1 w-24 bg-gradient-to-r from-[var(--tc-electric-blue)] to-[var(--tc-electric-cyan)] rounded-full mb-4" />
              <h2 className="text-xl sm:text-2xl font-medium text-white mb-3">Conclusion</h2>
              <div className="text-gray-300 text-sm sm:text-base space-y-3">
                <p>
                  Truth Camera demonstrates how Coinbase's Developer Platform enables practical solutions to pressing digital trust challenges. By combining camera-first user experience with blockchain immutability, we create verifiable provenance that scales globally while remaining accessible to non-technical users.
                </p>
                <p>
                  The convergence of AI-generated content and low-cost blockchain infrastructure creates a unique opportunity to establish new standards for digital media authenticity. Truth Camera positions itself at this intersection, leveraging Base's cost-efficiency and Coinbase Wallet's user experience to make verification ubiquitous.
                </p>
                <p>
                  Our hackathon MVP provides a solid foundation for this vision, with clear technical architecture and user experience that can scale from individual users to enterprise deployments. The future of digital media trust requires solutions that are both cryptographically sound and practically usable - Truth Camera delivers both.
                </p>
              </div>
            </section>
          </main>

          {/* Table of contents (right rail) */}
          <aside className="hidden lg:block">
            <nav className="sticky top-6 rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl p-4 tc-glow-blue">
              <div className="text-xs uppercase tracking-wide text-white/60 mb-2">On this page</div>
              <div className="space-y-1">
                <Link href="#abstract" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">Abstract</Link>
                <Link href="#introduction" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">1. Introduction</Link>
                <div className="pt-1">
                  <Link href="#technical-architecture" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">2. Technical Architecture</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#current-stack" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">2.1 Current Stack</Link>
                    <Link href="#data-architecture" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">2.2 Data Architecture</Link>
                    <Link href="#verification-workflow" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">2.3 Verification Workflow</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#coinbase-cdp" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">3. Coinbase CDP Benefits</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#base-advantages" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">3.1 Base Advantages</Link>
                    <Link href="#coinbase-wallet" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">3.2 Coinbase Wallet</Link>
                    <Link href="#onramp" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">3.3 Onramp</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#security-model" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">4. Security Model</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#attack-vectors" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">4.1 Attack Vectors</Link>
                    <Link href="#remaining-challenges" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">4.2 Remaining Challenges</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#target-markets" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">5. Target Markets</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#journalism-media" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">5.1 Journalism & Media</Link>
                    <Link href="#insurance-legal" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">5.2 Insurance & Legal</Link>
                    <Link href="#ecommerce-marketplaces" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">5.3 E-commerce & Marketplaces</Link>
                    <Link href="#social-platforms" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">5.4 Social Platforms</Link>
                    <Link href="#implementation-examples" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">5.5 Examples</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#user-experience" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">6. User Experience</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#capture-flow" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">6.1 Capture Flow</Link>
                    <Link href="#verification-interface" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">6.2 Verification Interface</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#technical-innovation" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">7. Technical Innovation</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#near-term-enhancements" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">7.1 Near-Term Enhancements</Link>
                    <Link href="#advanced-features" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">7.2 Advanced Features</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#competitive-landscape" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">8. Competitive Landscape</Link>
                </div>
                <div className="pt-1">
                  <Link href="#success-metrics" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">9. Success Metrics</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#technical-performance" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">9.1 Technical Performance</Link>
                    <Link href="#adoption-indicators" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">9.2 Adoption Indicators</Link>
                  </div>
                </div>
                <div className="pt-1">
                  <Link href="#implementation-roadmap" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">10. Implementation Roadmap</Link>
                  <div className="ml-3 mt-1 space-y-1">
                    <Link href="#hackathon-mvp" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">10.1 Hackathon MVP</Link>
                    <Link href="#near-term-development" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">10.2 Near-Term Development</Link>
                    <Link href="#long-term-vision" className="block px-3 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/5">10.3 Long-Term Vision</Link>
                  </div>
                </div>
                <Link href="#vision" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">Vision</Link>
                <Link href="#principles" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">Principles</Link>
                <Link href="#how" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">How it works</Link>
                <Link href="#api" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">API & Contracts</Link>
                <Link href="#roadmap" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">Roadmap</Link>
                <Link href="#conclusion" className="block px-3 py-2 rounded-lg text-sm text-white/80 hover:text-white hover:bg-white/5">Conclusion</Link>
              </div>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}


