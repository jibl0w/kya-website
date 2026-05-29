import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen" style={{
      background: "#080C14",
      color: "#E8E0D0",
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

        :root {
          --navy: #080C14;
          --navy-2: #0D1420;
          --navy-3: #121B2E;
          --navy-4: #1A2540;
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: rgba(201, 168, 76, 0.15);
          --gold-border: rgba(201, 168, 76, 0.25);
          --text-primary: #E8E0D0;
          --text-secondary: #8A9AB5;
          --text-muted: #4A5568;
          --white-border: rgba(255,255,255,0.06);
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .display { font-family: 'Cormorant Garamond', serif; }
        .mono { font-family: 'DM Mono', monospace; }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.02em;
          transition: color 0.2s;
        }
        .nav-link:hover { color: var(--gold-light); }

        .btn-primary {
          background: var(--gold);
          color: var(--navy);
          padding: 12px 28px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 0.04em;
          text-decoration: none;
          display: inline-block;
          transition: background 0.2s, transform 0.1s;
          text-transform: uppercase;
        }
        .btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }

        .btn-secondary {
          border: 1px solid var(--gold-border);
          color: var(--gold);
          padding: 11px 28px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 13px;
          letter-spacing: 0.04em;
          text-decoration: none;
          display: inline-block;
          transition: all 0.2s;
          text-transform: uppercase;
          background: transparent;
          cursor: pointer;
        }
        .btn-secondary:hover { background: var(--gold-dim); }

        .card {
          background: var(--navy-2);
          border: 1px solid var(--white-border);
          border-radius: 12px;
          padding: 32px;
          transition: border-color 0.2s;
        }
        .card:hover { border-color: var(--gold-border); }

        .gold-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--gold-dim);
          border: 1px solid var(--gold-border);
          border-radius: 100px;
          padding: 6px 16px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold);
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 16px;
        }

        .divider {
          width: 40px;
          height: 2px;
          background: var(--gold);
          margin: 24px 0;
        }

        .geo-line {
          position: absolute;
          background: linear-gradient(90deg, transparent, var(--gold-border), transparent);
          height: 1px;
          width: 100%;
        }

        .stat-card {
          text-align: center;
          padding: 32px 24px;
          border-right: 1px solid var(--white-border);
        }
        .stat-card:last-child { border-right: none; }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--gold-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          color: var(--gold);
          flex-shrink: 0;
        }

        .hero-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            radial-gradient(circle at 20% 50%, rgba(201, 168, 76, 0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(201, 168, 76, 0.03) 0%, transparent 40%),
            linear-gradient(rgba(201, 168, 76, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.02) 1px, transparent 1px);
          background-size: 100% 100%, 100% 100%, 60px 60px, 60px 60px;
          pointer-events: none;
        }

        .tag {
          display: inline-block;
          background: var(--navy-3);
          border: 1px solid var(--white-border);
          border-radius: 4px;
          padding: 4px 10px;
          font-size: 11px;
          color: var(--text-secondary);
          font-family: 'DM Mono', monospace;
        }

        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .stack-mobile { flex-direction: column !important; }
          .full-mobile { width: 100% !important; }
          .stat-card { border-right: none; border-bottom: 1px solid var(--white-border); }
          .stat-card:last-child { border-bottom: none; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(8, 12, 20, 0.92)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 48px",
        height: "68px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: "100%",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "48px" }}>
          <div>
            <span className="display" style={{ fontSize: "24px", fontWeight: 700, color: "#E8E0D0", letterSpacing: "-0.02em" }}>
              KY<span style={{ color: "var(--gold)" }}>A</span>
            </span>
          </div>
          <div className="hide-mobile" style={{ display: "flex", gap: "32px" }}>
            <a href="#about" className="nav-link">About</a>
            <a href="#how-it-works" className="nav-link">How It Works</a>
            <a href="#sectors" className="nav-link">Sectors</a>
            <a href="#contact" className="nav-link">Contact</a>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a href="#contact" className="btn-secondary hide-mobile">Request Demo</a>
          <a href="#contact" className="btn-primary">Contact Us</a>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", overflow: "hidden", padding: "120px 48px 100px", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="hero-pattern" />
        <div style={{ position: "absolute", top: 0, right: 0, width: "600px", height: "100%", background: "linear-gradient(135deg, transparent 40%, rgba(201, 168, 76, 0.03) 100%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative" }}>
          <div style={{ maxWidth: "760px" }}>
            <div className="gold-badge" style={{ marginBottom: "32px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)", display: "inline-block" }} />
              Cross-Border Trade Infrastructure
            </div>

            <h1 className="display" style={{
              fontSize: "clamp(48px, 6vw, 88px)",
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
              color: "#E8E0D0",
              marginBottom: "28px"
            }}>
              The Infrastructure Layer for
              <span style={{ color: "var(--gold)", fontStyle: "italic" }}> Nigeria–Asia</span> Trade
            </h1>

            <p style={{ fontSize: "18px", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: "560px", marginBottom: "48px", fontWeight: 300 }}>
              KYA connects Nigerian businesses with verified Asian suppliers through a structured, compliance-first digital trade corridor — from verification to settlement.
            </p>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <a href="#contact" className="btn-primary" style={{ padding: "16px 36px", fontSize: "14px" }}>
                Request a Demo
              </a>
              <a href="#how-it-works" className="btn-secondary" style={{ padding: "15px 36px", fontSize: "14px" }}>
                How It Works
              </a>
            </div>

            <div style={{ marginTop: "64px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
              {[
                { label: "Compliance-First", desc: "Built around CBN and international regulatory standards" },
                { label: "End-to-End", desc: "From KYC verification to final settlement" },
                { label: "Fully Traceable", desc: "Every step of the trade lifecycle is documented" },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--gold-dim)", border: "1px solid var(--gold-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--gold)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{item.label}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", lineHeight: 1.4 }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <div style={{ background: "var(--navy-2)", borderTop: "1px solid var(--white-border)", borderBottom: "1px solid var(--white-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {[
            { value: "5", label: "Trade Categories", sub: "Verified supplier sectors" },
            { value: "13", label: "Process Steps", sub: "Platform-controlled workflow" },
            { value: "100%", label: "Traceable", sub: "Full audit trail" },
            { value: "CBN", label: "Compliant", sub: "Regulatory alignment" },
          ].map(stat => (
            <div key={stat.label} className="stat-card">
              <p className="display" style={{ fontSize: "42px", fontWeight: 600, color: "var(--gold)", letterSpacing: "-0.02em", lineHeight: 1 }}>{stat.value}</p>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "8px" }}>{stat.label}</p>
              <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{stat.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{ padding: "120px 48px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <p className="section-label">About KYA</p>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "24px" }}>
              Built for the Realities of Nigerian Trade
            </h2>
            <div className="divider" />
            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "24px", fontWeight: 300 }}>
              KYA Digital Services is a Nigerian-registered technology company that operates as the infrastructure layer for cross-border trade between Nigeria and Asia.
            </p>
            <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "40px", fontWeight: 300 }}>
              We do not move money. We do not hold goods. We orchestrate — bringing together verified suppliers, banking partners, and compliance infrastructure into a single, controlled trade environment.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {["CAC Registered", "Nigeria-Based", "Trade Infrastructure", "Not a PSP", "Not a Bank"].map(tag => (
                <span key={tag} className="tag">{tag}</span>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { title: "Platform Orchestration", text: "KYA coordinates every party in the transaction — the customer, the banking layer, the supplier, and the settlement infrastructure — through a single controlled interface." },
              { title: "Compliance by Design", text: "Verification, documentation, and regulatory requirements are embedded into every step of the trade process, not added as an afterthought." },
              { title: "Supplier Verification", text: "Every supplier in our network is independently verified. Factory audits, documentation checks, and pre-shipment inspections are standard." },
              { title: "Settlement Infrastructure", text: "We work with regulated banking and payment institutions to ensure every trade settles correctly, with full documentation and audit trails." },
            ].map((item, i) => (
              <div key={i} className="card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--text-secondary)" }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: "var(--navy-2)", padding: "120px 48px", borderTop: "1px solid var(--white-border)", borderBottom: "1px solid var(--white-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p className="section-label">The Process</p>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "16px" }}>
              A Structured Path from Enquiry to Delivery
            </h2>
            <p style={{ fontSize: "16px", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto", fontWeight: 300, lineHeight: 1.7 }}>
              Every KYA transaction follows a documented, platform-controlled process. Nothing moves until each step is verified and authorised.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {[
              { step: "01", title: "Customer Verification", text: "Customers complete identity or business verification through our compliance-first onboarding. Both individual and corporate accounts are supported." },
              { step: "02", title: "Supplier Selection", text: "Customers browse and select from our network of verified Asian suppliers across five strategic trade categories." },
              { step: "03", title: "Trade Documentation", text: "Required trade documents are submitted and verified through the platform — including regulatory filings and import documentation." },
              { step: "04", title: "Funding & Banking", text: "The transaction is funded through our banking partners. A Letter of Credit is structured to protect both the customer and supplier." },
              { step: "05", title: "Inspection & Shipment", text: "Goods are inspected by KYA-appointed agents before shipment. Shipping documents are verified before any funds are released." },
              { step: "06", title: "Settlement & Closure", text: "Foreign exchange is processed through regulated channels. Funds are settled to the supplier and the trade is closed with a full audit trail." },
            ].map((item) => (
              <div key={item.step} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                  <div className="step-number">{item.step}</div>
                  <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>{item.title}</h3>
                </div>
                <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--text-secondary)" }}>{item.text}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: "64px", background: "var(--navy-3)", border: "1px solid var(--gold-border)", borderRadius: "12px", padding: "40px", textAlign: "center" }}>
            <p className="display" style={{ fontSize: "24px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
              Every step is recorded. Every party is verified. Every transaction is traceable.
            </p>
            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              KYA maintains a complete audit trail from customer onboarding to final settlement.
            </p>
          </div>
        </div>
      </section>

      {/* SECTORS */}
      <section id="sectors" style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "64px", flexWrap: "wrap", gap: "24px" }}>
            <div>
              <p className="section-label">Supplier Sectors</p>
              <h2 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                Five Strategic Trade Categories
              </h2>
            </div>
            <p style={{ fontSize: "15px", color: "var(--text-secondary)", maxWidth: "360px", fontWeight: 300, lineHeight: 1.7 }}>
              Our verified supplier network covers the sectors most critical to Nigerian business growth and infrastructure development.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "16px" }}>
            {[
              { icon: "⚡", title: "Electronics & Consumer Technology", text: "Devices, accessories, appliances, and smart technology." },
              { icon: "☀️", title: "Solar & Energy Infrastructure", text: "Solar systems, inverters, batteries, and energy equipment." },
              { icon: "⚙️", title: "Industrial Machinery", text: "Production equipment, automation, and factory systems." },
              { icon: "🏗️", title: "Construction & Building Materials", text: "Structural materials, fittings, and building supplies." },
              { icon: "📦", title: "Packaging & Manufacturing Inputs", text: "Raw materials, plastics, textiles, and packaging." },
            ].map((sector, i) => (
              <div key={i} className="card" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "32px", marginBottom: "16px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--navy-3)", borderRadius: "8px" }}>
                  {sector.icon}
                </div>
                <h3 style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "8px", lineHeight: 1.4 }}>{sector.title}</h3>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: 1.5 }}>{sector.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR WHOM */}
      <section style={{ background: "var(--navy-2)", padding: "120px 48px", borderTop: "1px solid var(--white-border)", borderBottom: "1px solid var(--white-border)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "80px" }}>
            <p className="section-label">Who We Serve</p>
            <h2 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              Built for Two Audiences
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div style={{ background: "var(--navy-3)", border: "1px solid var(--gold-border)", borderRadius: "16px", padding: "48px" }}>
              <div className="gold-badge" style={{ marginBottom: "32px" }}>Nigerian Importers & Businesses</div>
              <h3 className="display" style={{ fontSize: "32px", fontWeight: 600, marginBottom: "20px", lineHeight: 1.2 }}>
                Trade with Confidence
              </h3>
              <div className="divider" />
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "32px", fontWeight: 300 }}>
                Stop navigating the complexity of cross-border trade alone. KYA handles verification, documentation, supplier due diligence, and banking coordination — so you can focus on your business.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Access to verified, audited suppliers", "Structured trade documentation support", "Regulatory-compliant import process", "Full visibility at every stage"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--gold)", fontSize: "12px" }}>◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "16px", padding: "48px" }}>
              <div className="gold-badge" style={{ marginBottom: "32px" }}>Banking & Institutional Partners</div>
              <h3 className="display" style={{ fontSize: "32px", fontWeight: 600, marginBottom: "20px", lineHeight: 1.2 }}>
                A Structured Partner
              </h3>
              <div className="divider" />
              <p style={{ fontSize: "15px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "32px", fontWeight: 300 }}>
                KYA provides institutional partners with pre-verified customers, structured trade documentation, and a controlled transaction environment that meets compliance requirements.
              </p>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                {["Pre-verified KYC and KYB customers", "Structured trade documentation packages", "Platform-controlled transaction flow", "Full audit trail and compliance records"].map(item => (
                  <li key={item} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", color: "var(--text-secondary)" }}>
                    <span style={{ color: "var(--gold)", fontSize: "12px" }}>◆</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ padding: "120px 48px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "start" }}>
            <div>
              <p className="section-label">Get in Touch</p>
              <h2 className="display" style={{ fontSize: "clamp(36px, 4vw, 56px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "24px" }}>
                Let's Talk About Your Trade Needs
              </h2>
              <div className="divider" />
              <p style={{ fontSize: "16px", lineHeight: 1.8, color: "var(--text-secondary)", marginBottom: "48px", fontWeight: 300 }}>
                Whether you are a Nigerian importer looking to source from Asia, a banking institution interested in partnership, or a supplier wanting to join our network — we want to hear from you.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {[
                  { type: "Trade Enquiry", desc: "Nigerian importers and businesses looking to use the KYA platform" },
                  { type: "Banking Partnership", desc: "Financial institutions interested in partnering with KYA" },
                  { type: "Supplier Onboarding", desc: "Asian suppliers looking to join the KYA verified network" },
                  { type: "Investor Relations", desc: "Investors interested in the KYA opportunity" },
                ].map(item => (
                  <div key={item.type} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <span style={{ color: "var(--gold)", fontSize: "12px", marginTop: "4px" }}>◆</span>
                    <div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "2px" }}>{item.type}</p>
                      <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "48px", padding: "24px", background: "var(--navy-2)", border: "1px solid var(--white-border)", borderRadius: "8px" }}>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>Email</p>
                <p style={{ fontSize: "15px", color: "var(--text-primary)" }}>info@kya.ng</p>
              </div>
            </div>
            <div style={{ background: "var(--navy-2)", border: "1px solid var(--white-border)", borderRadius: "16px", padding: "48px" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>Request a Demo</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "32px" }}>Complete this form and we will be in touch within 2 business days.</p>
              <ContactFormInline />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "var(--navy-2)", borderTop: "1px solid var(--white-border)", padding: "64px 48px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "48px", marginBottom: "64px" }}>
            <div>
              <span className="display" style={{ fontSize: "28px", fontWeight: 700, color: "#E8E0D0", letterSpacing: "-0.02em", display: "block", marginBottom: "16px" }}>
                KY<span style={{ color: "var(--gold)" }}>A</span>
              </span>
              <p style={{ fontSize: "13px", lineHeight: 1.7, color: "var(--text-muted)", maxWidth: "280px" }}>
                Digital trade infrastructure enabling structured, compliant, and fully traceable cross-border trade between Nigeria and Asia.
              </p>
              <div style={{ marginTop: "24px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {["CAC Registered", "Not a PSP", "Not a Bank"].map(tag => (
                  <span key={tag} className="tag" style={{ fontSize: "10px" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px" }}>Platform</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["How It Works", "Supplier Sectors", "For Businesses", "For Institutions"].map(item => (
                  <a key={item} href="#" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>{item}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px" }}>Company</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {["About KYA", "Our Approach", "Compliance", "Contact"].map(item => (
                  <a key={item} href="#" style={{ fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}>{item}</a>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "20px" }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>info@kya.ng</p>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Lagos, Nigeria</p>
                <a href="#contact" className="btn-primary" style={{ marginTop: "8px", textAlign: "center", padding: "10px 20px", fontSize: "12px" }}>
                  Request Demo
                </a>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid var(--white-border)", paddingTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>© 2026 KYA Digital Services Ltd. All rights reserved. CAC Registered. Nigeria.</p>
            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>Not a Payment Service Provider · Not a Bank · Trade Infrastructure Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ContactFormInline() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <input placeholder="First Name" style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", outline: "none", width: "100%" }} />
        <input placeholder="Last Name" style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", outline: "none", width: "100%" }} />
      </div>
      <input placeholder="Email Address" style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", outline: "none", width: "100%" }} />
      <input placeholder="Company / Organisation" style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", outline: "none", width: "100%" }} />
      <select style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-secondary)", outline: "none", width: "100%" }}>
        <option value="">Type of Enquiry</option>
        <option>Trade Enquiry — I want to import goods</option>
        <option>Banking Partnership</option>
        <option>Supplier Onboarding</option>
        <option>Investor Relations</option>
        <option>Other</option>
      </select>
      <textarea placeholder="Tell us about your enquiry..." rows={4} style={{ background: "var(--navy-3)", border: "1px solid var(--white-border)", borderRadius: "8px", padding: "12px 16px", fontSize: "13px", color: "var(--text-primary)", outline: "none", width: "100%", resize: "none", fontFamily: "inherit" }} />
      <button style={{ background: "var(--gold)", color: "var(--navy)", padding: "14px", borderRadius: "8px", fontWeight: 600, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", border: "none", cursor: "pointer", width: "100%" }}>
        Send Message
      </button>
      <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center" }}>We respond within 2 business days · info@kya.ng</p>
    </div>
  );
}