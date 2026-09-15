"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { slugify } from "@/lib/project-utils";
import { ProjectMedia } from "@/components/project-media";
import {
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Cloud,
  Database,
  Eye,
  FileBarChart,
  FileSearch,
  FileText,
  Gauge,
  GitBranch,
  Globe2,
  Headset,
  Layers3,
  Mail,
  Menu,
  Play,
  Repeat2,
  Table2,
  Timer,
  X,
  Zap,
} from "lucide-react";

const problems = [
  [
    "repeat",
    "Repetitive manual tasks",
    "Skilled analysts repeating identical copy-paste sequences between portals daily.",
  ],
  [
    "sync",
    "Copying data between systems",
    "Isolated ERP and CRM databases requiring slow, error-prone manual sync intervals.",
  ],
  [
    "report",
    "Manual reporting",
    "Extracting CSV dumps, compiling charts, and emailing PDFs every Friday.",
  ],
  [
    "hourglass",
    "Slow approval processes",
    "Purchase orders, contracts, and requisitions stalled in bloated inbox queues.",
  ],
  [
    "sheet",
    "Spreadsheet-heavy workflows",
    "Brittle Excel macros and Google Sheets acting as duct tape for core pipelines.",
  ],
  [
    "support",
    "Repetitive customer support",
    "Handling high-volume L1 order lookups, returns, and status pings with human agents.",
  ],
  [
    "doc",
    "Manual document processing",
    "Keying invoice figures, receipts, and compliance forms by eye rather than OCR.",
  ],
  [
    "eye",
    "Lack of visibility",
    "Zero central observability over process throughput, bottlenecks, or turnaround speed.",
  ],
];
const problemIcons = [
  Repeat2,
  Globe2,
  FileBarChart,
  Timer,
  Table2,
  Headset,
  FileSearch,
  Eye,
];
const faqs = [
  [
    "How fast can we deploy our first automation workflow?",
    "Typical rapid-impact workflows are live within 7 to 14 days. Complex enterprise workflows with deep legacy ERP tie-ins usually take 3 to 6 weeks.",
  ],
  [
    "Do you train AI models on our proprietary corporate data?",
    "No. We use zero-retention enterprise API endpoints. Your company data is never used to train public model weights.",
  ],
  [
    "What happens if an external API or website changes?",
    "Defensive error handling, fallback alerting, and self-healing retries catch changes immediately, with SLAs for resolution.",
  ],
  [
    "Can we manage the workflows internally after delivery?",
    "Yes. We provide source code, visual workflow maps, administrative ownership, and recorded training sessions.",
  ],
];
type ProjectCard = {
  id: string;
  title: string;
  tag: string;
  desc: string;
  tech: string[];
  image: string;
  video: string;
  slug: string;
};

function Header() {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const navItems = [
    ["top", "Home"],
    ["services", "Services"],
    ["projects", "Our Work"],
    ["approach", "About"],
    ["audit", "Contact"],
  ] as const;

  useEffect(() => {
    const updateActiveSection = () => {
      const marker = window.scrollY + 120;
      let currentSection = "top";

      for (const [sectionId] of navItems) {
        const section = document.getElementById(sectionId);
        if (section && section.offsetTop <= marker) currentSection = sectionId;
      }

      setActiveSection(currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    return () => window.removeEventListener("scroll", updateActiveSection);
  }, []);

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="brand" href="/">
          <span className="brand-mark">AIQ</span>Automate
          <span>
            <em>IQ</em>
          </span>
        </Link>
        <nav className="nav-links">
          {navItems.map(([id, label]) => (
            <a
              className={activeSection === id ? "active" : ""}
              href={`#${id}`}
              aria-current={activeSection === id ? "page" : undefined}
              key={id}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          <a className="button primary" href="#audit">
            Book a Consultation
          </a>
          <button
            className="menu-toggle"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav">
            {navItems.slice(1).map(([id, label]) => (
              <a href={`#${id}`} onClick={() => setOpen(false)} key={id}>
                {label}
              </a>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}

function DemoModal({
  close,
  title,
  videoUrl,
}: {
  close: () => void;
  title: string;
  videoUrl: string;
}) {
  const youtubeId = videoUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&/]+)/,
  )?.[1];
  return (
    <div className="modal-backdrop" onClick={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-top">
          <strong>{title} demo</strong>
          <button onClick={close} aria-label="Close demo">
            <X size={20} />
          </button>
        </div>
        <div className="modal-video">
          {youtubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
              title={`${title} demo`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video src={videoUrl} controls autoPlay playsInline />
          )}
        </div>
        <div className="modal-copy">
          <h3>See the workflow run end to end</h3>
          <p>
            Watch the real project walkthrough and see the workflow run end to
            end.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [demo, setDemo] = useState<ProjectCard | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [contactError, setContactError] = useState("");
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  useEffect(() => {
    fetch("/api/projects")
      .then((response) => response.json())
      .then((body) => {
        if (Array.isArray(body.projects))
          setProjects(
            body.projects.map(
              (project: {
                id: string;
                title: string;
                category: string;
                description: string;
                image_url: string | null;
                video_url: string | null;
                technologies: string[];
                slug: string;
              }) => ({
                id: project.id,
                title: project.title,
                tag: project.category,
                desc: project.description,
                tech: project.technologies,
                image: project.image_url ?? "",
                video: project.video_url ?? "",
                slug: project.slug,
              }),
            ),
          );
      })
      .catch(() => setProjects([]));
  }, []);
  async function submitInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setContactError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.get("email"),
        company_size: data.get("company_size"),
        process: data.get("process"),
      }),
    });
    if (!response.ok) {
      setContactError("Unable to submit right now. Please try again.");
      return;
    }
    setSubmitted(true);
    form.reset();
  }
  return (
    <>
      <Header />
      <main id="top">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow" style={{ color: "var(--cyan-bright)" }}>
                AI Automation Agency
              </span>
              <h1>
                Turn repetitive work into <span>intelligent automation.</span>
              </h1>
              <p>
                We help forward-thinking enterprises automate manual pipelines,
                connect disparate architectures, and deploy custom autonomous
                agents for resilient operations.
              </p>
              <div className="hero-actions">
                <a className="button primary" href="#projects">
                  Explore Our Work <ArrowRight size={16} />
                </a>
                <a className="button ghost" href="#audit">
                  <Calendar size={16} /> Book a Consultation
                </a>
              </div>
              <div className="trust">
                <span>
                  <i />
                  AI automation
                </span>
                <span>
                  <i />
                  Business process automation
                </span>
                <span>
                  <i />
                  Intelligent workflows
                </span>
              </div>
            </div>
            <div className="system-visual">
              <div className="core">
                AI<small>ENGINE CORE</small>
              </div>
              <div className="node n1">
                <Cloud size={18} />
                <div>
                  <b>Cloud</b>
                  <small>APIs & webhooks</small>
                </div>
              </div>
              <div className="node n2">
                <Database size={18} />
                <div>
                  <b>Database</b>
                  <small>Postgres / vector</small>
                </div>
              </div>
              <div className="node n3">
                <GitBranch size={18} />
                <div>
                  <b>CRM</b>
                  <small>Salesforce / HubSpot</small>
                </div>
              </div>
              <div className="node n4">
                <Mail size={18} />
                <div>
                  <b>Email</b>
                  <small>Slack & Exchange</small>
                </div>
              </div>
              <div className="latency">
                <Zap size={14} color="var(--cyan)" /> Sub-second routing latency
              </div>
            </div>
          </div>
        </section>
        <section className="strip">
          <div className="container strip-grid">
            <div className="metric">
              <span className="metric-icon">
                <Gauge size={20} />
              </span>
              <div>
                <strong>85% fewer errors</strong>
                <small>Across automated workflows</small>
              </div>
            </div>
            <div className="metric">
              <span className="metric-icon">
                <Zap size={20} />
              </span>
              <div>
                <strong>14× execution speedup</strong>
                <small>From trigger to completion</small>
              </div>
            </div>
            <div className="metric">
              <span className="metric-icon">
                <Layers3 size={20} />
              </span>
              <div>
                <strong>2.4 month payback</strong>
                <small>Average client benchmark</small>
              </div>
            </div>
          </div>
        </section>
        <section className="section problem" id="services">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">The problem</span>
              <h2>
                Your team should not spend hours doing work software can do
                automatically.
              </h2>
              <p>
                Manual execution drains senior operations bandwidth, introduces
                error margins, and slows your go-to-market cadence.
              </p>
            </div>
            <div className="card-grid">
              {problems.map((p, i) => (
                <article className="info-card" key={p[1]}>
                  <div className="info-icon">
                    {(() => {
                      const Icon = problemIcons[i];
                      return <Icon size={20} strokeWidth={1.8} />;
                    })()}
                  </div>
                  <h3>{p[1]}</h3>
                  <p>{p[2]}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Our solution</span>
              <h2>
                We transform high-friction processes into intelligent, automated
                workflows.
              </h2>
              <p>
                Shift from human handoffs to frictionless continuous-state
                execution.
              </p>
            </div>
            <div className="compare">
              <div className="compare-panel dark">
                <header>
                  <h3>Manual process</h3>
                  <span className="status">High friction</span>
                </header>
                {[
                  "Human input",
                  "Spreadsheet staging",
                  "Email drafting",
                  "Manager approval queue",
                  "ERP data entry",
                ].map((x) => (
                  <div className="step" key={x}>
                    <X size={17} />
                    <div>
                      <strong>{x}</strong>
                      <small>
                        Slow, repetitive, and dependent on a single operator.
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <div className="arrow">
                <ArrowRight size={22} />
              </div>
              <div className="compare-panel light">
                <header>
                  <h3>Automated workflow</h3>
                  <span className="status good">Autonomous flow</span>
                </header>
                {[
                  "Event-driven trigger",
                  "AI extraction & categorization",
                  "Deterministic business logic",
                  "Dual-way system integration",
                  "Completed execution in 1.2s",
                ].map((x) => (
                  <div className="step" key={x}>
                    <Check size={17} />
                    <div>
                      <strong>{x}</strong>
                      <small>
                        Validated, observable, and ready for the next state.
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        <section className="section projects" id="projects">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Featured projects</span>
              <h2>Real automation. Practical operational ROI.</h2>
              <p>
                Selected systems designed, shipped, and measured in production
                environments.
              </p>
            </div>
            <div className="project-grid">
              {projects.length === 0 && (
                <p className="empty-projects">
                  Projects will appear here once you publish them from the admin
                  dashboard.
                </p>
              )}
              {projects.map((project) => (
                <article className="project-card" key={project.title}>
                  <div className="project-image">
                    <ProjectMedia src={project.image} alt={project.title} />
                    <span className="project-tag">{project.tag}</span>
                    <button
                      className="project-play"
                      onClick={() => project.video && setDemo(project)}
                      disabled={!project.video}
                      aria-label={`Play ${project.title} demo`}
                    >
                      <Play size={20} fill="currentColor" />
                    </button>
                  </div>
                  <div className="project-body">
                    <h3>{project.title}</h3>
                    <p>{project.desc}</p>
                    <div className="tags">
                      {project.tech.map((t) => (
                        <span key={t}>{t}</span>
                      ))}
                    </div>
                    <Link
                      className="text-link"
                      href={`/case-study/${slugify(project.slug || project.title)}`}
                    >
                      View case study <ArrowRight size={14} />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="section audit" id="audit">
          <div className="container">
            <div className="audit-box">
              <div>
                <span className="eyebrow">Automation impact</span>
                <div className="section-head">
                  <h2>How many hours does your team lose every week?</h2>
                  <p>
                    Most mid-market businesses waste 35–45% of knowledge-worker
                    time on reconciliations, copy-paste workflows, and manual
                    notifications.
                  </p>
                </div>
                <div className="audit-stats">
                  <div className="audit-stat">
                    <strong>85%</strong>
                    <small>Error elimination</small>
                  </div>
                  <div className="audit-stat">
                    <strong>14×</strong>
                    <small>Execution speedup</small>
                  </div>
                  <div className="audit-stat">
                    <strong>2.4mo</strong>
                    <small>Average payback</small>
                  </div>
                </div>
              </div>
              <div className="form-box">
                <h3>Request a free workflow audit</h3>
                <p>
                  Our senior engineers will review your manual processes and
                  produce a one-page architectural blueprint.
                </p>
                <form onSubmit={submitInquiry}>
                  <div className="field">
                    <label>Work email</label>
                    <input
                      required
                      name="email"
                      type="email"
                      placeholder="alex@company.com"
                    />
                  </div>
                  <div className="field">
                    <label>Company size</label>
                    <select name="company_size">
                      <option>10 - 50 employees</option>
                      <option>51 - 250 employees</option>
                      <option>250+ employees</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Target process to automate</label>
                    <input
                      name="process"
                      placeholder="e.g. invoice reconciliation"
                    />
                  </div>
                  <button className="button primary" type="submit">
                    Generate my strategy <ArrowRight size={16} />
                  </button>
                  {submitted && (
                    <div className="success">
                      ✓ Blueprint request submitted. We will be in touch within
                      24 hours.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
        <section className="section" id="approach">
          <div className="container">
            <div className="section-head center">
              <span className="eyebrow">Clarifications</span>
              <h2>Frequently asked questions</h2>
              <p>
                Everything you need to know about implementation, security, and
                maintenance.
              </p>
            </div>
            <div className="faq-list">
              {faqs.map((faq) => (
                <details className="faq" key={faq[0]}>
                  <summary>
                    {faq[0]}
                    <ChevronDown size={17} />
                  </summary>
                  <p>{faq[1]}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="cta">
          <div className="container">
            <span className="eyebrow" style={{ color: "var(--cyan-bright)" }}>
              Start your transformation
            </span>
            <h2>Ready to automate the work that slows your business down?</h2>
            <p>
              Schedule a 30-minute discovery session with our automation
              architects. We will identify three high-impact workflows you can
              automate this month.
            </p>
            <div className="hero-actions">
              <a className="button primary" href="#audit">
                Book a consultation <Calendar size={16} />
              </a>
              <a className="button ghost" href="#projects">
                Explore case studies
              </a>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Link className="brand" href="/">
                <span className="brand-mark">AIQ</span>Automate
                <span>
                  <em>IQ</em>
                </span>
              </Link>
              <p>
                Enterprise-grade intelligent automation architectures, cognitive
                bots, and autonomous workflows engineered for modern operators.
              </p>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li>About AutomateIQ</li>
                <li>Case studies</li>
                <li>Security & compliance</li>
                <li>Careers</li>
              </ul>
            </div>
            <div>
              <h4>Solutions</h4>
              <ul>
                <li>AI agents</li>
                <li>Workflow automation</li>
                <li>Document processing</li>
                <li>System integration</li>
              </ul>
            </div>
            <div>
              <h4>Connect</h4>
              <p>Subscribe to our quarterly enterprise automation briefing.</p>
              <div className="field">
                <input placeholder="executive@domain.com" type="email" />
              </div>
            </div>
          </div>
          <div className="copyright">
            <span>© 2026 AutomateIQ Agency Inc.</span>
            <span>Privacy policy · Terms · Security architecture</span>
          </div>
        </div>
      </footer>
      {demo && (
        <DemoModal
          close={() => setDemo(null)}
          title={demo.title}
          videoUrl={demo.video}
        />
      )}
    </>
  );
}
