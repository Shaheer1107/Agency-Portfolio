import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/supabase/database.types";
import { getYouTubeEmbedUrl, isImageUrl, slugify } from "@/lib/project-utils";

async function getProject(slug: string): Promise<Project | null> {
  const supabase = await createClient();
  const requestedSlug = decodeURIComponent(slug);
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (
    data?.find(
      (project) =>
        project.slug === requestedSlug ||
        slugify(project.slug) === slugify(requestedSlug) ||
        slugify(project.title) === slugify(requestedSlug),
    ) ?? null
  );
}

export default async function DynamicCaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const project = await getProject((await params).slug);
  if (!project)
    return (
      <main className="case-hero">
        <div className="container">
          <span className="eyebrow">Project unavailable</span>
          <h1>This case study is not published.</h1>
          <Link className="text-link" href="/">
            <ArrowLeft size={15} /> Back to our work
          </Link>
        </div>
      </main>
    );
  const results = Object.entries(project.results ?? {});
  const imageIsValid = isImageUrl(project.image_url);
  const videoEmbed = getYouTubeEmbedUrl(project.video_url);
  return (
    <>
      <header className="site-header">
        <div className="container nav">
          <Link className="brand" href="/">
            <span className="brand-mark">AIQ</span>Automate
            <span>
              <em>IQ</em>
            </span>
          </Link>
          <Link className="button primary" href="/#audit">
            Book a Consultation
          </Link>
        </div>
      </header>
      <main>
        <section className="case-hero">
          <div className="container">
            <Link className="text-link" href="/">
              <ArrowLeft size={15} /> Back to our work
            </Link>
            <div className="case-grid">
              <div>
                <span className="eyebrow">{project.category}</span>
                <h1>{project.title}</h1>
                <p>{project.description}</p>
                <div className="chips">
                  {project.technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
                {project.video_url && (
                  <a className="button primary" href="#project-video">
                    Watch project demo <ArrowRight size={16} />
                  </a>
                )}
              </div>
              {imageIsValid ? (
                <div className="case-visual">
                  <img src={project.image_url ?? ""} alt={project.title} />
                </div>
              ) : (
                <div className="case-visual media-placeholder">
                  <FileText size={32} />
                  <span>
                    Project cover image will appear here after uploading a
                    direct image file.
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Case study</span>
              <h2>How this system creates operational leverage.</h2>
            </div>
            <div className="compare-panel light">
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  color: "var(--muted)",
                  lineHeight: 1.8,
                }}
              >
                {project.case_study ||
                  "Detailed case study information will be added soon."}
              </p>
              {results.length > 0 ? (
                <div className="case-meta" style={{ marginTop: 28 }}>
                  {results.map(([label, value]) => (
                    <div className="metric" key={label}>
                      <span className="metric-icon">
                        <Check size={20} />
                      </span>
                      <div>
                        <strong>{label}</strong>
                        <small>{String(value)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="case-empty-note">
                  Project results and delivery metrics have not been added yet.
                </p>
              )}
            </div>
          </div>
        </section>
        {project.video_url && (
          <section className="section" id="project-video">
            <div className="container">
              <div className="section-head">
                <span className="eyebrow">Project demo</span>
                <h2>See the workflow in action.</h2>
              </div>
              <div className="case-video">
                {videoEmbed ? (
                  <iframe
                    src={videoEmbed}
                    title={`${project.title} demo`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={project.video_url} controls playsInline />
                )}
              </div>
            </div>
          </section>
        )}
        <section className="case-band">
          <div className="container case-meta">
            <div className="metric">
              <span className="metric-icon">
                <Database size={20} />
              </span>
              <div>
                <strong>
                  {project.technologies.length} integrated technologies
                </strong>
                <small>Built for repeatable delivery</small>
              </div>
            </div>
            <div className="metric">
              <span className="metric-icon">
                <FileText size={20} />
              </span>
              <div>
                <strong>Auditable workflow</strong>
                <small>Clear inputs, states, and outputs</small>
              </div>
            </div>
            <div className="metric">
              <span className="metric-icon">
                <ShieldCheck size={20} />
              </span>
              <div>
                <strong>Production-ready</strong>
                <small>Designed around reliable operations</small>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="container">
          <div className="copyright">
            <span>© 2026 AutomateIQ Agency Inc.</span>
            <Link href="/">Back to home</Link>
          </div>
        </div>
      </footer>
    </>
  );
}
