"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { LogOut, Mail, Pencil, Plus, RefreshCw, Reply, Save, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { Project } from "@/lib/supabase/database.types";
import { slugify } from "@/lib/project-utils";
import "./admin.css";

type ProjectForm = {
  title: string;
  slug: string;
  category: string;
  description: string;
  case_study: string;
  image_url: string;
  video_url: string;
  technologies: string;
  published: boolean;
};
type Inquiry = {
  id: string;
  email: string;
  company_size: string | null;
  process: string | null;
  message: string | null;
  status: string;
  replied_at: string | null;
  created_at: string;
};
const emptyForm: ProjectForm = {
  title: "",
  slug: "",
  category: "Automation",
  description: "",
  case_study: "",
  image_url: "",
  video_url: "",
  technologies: "",
  published: false,
};

function toForm(project: Project): ProjectForm {
  return {
    title: project.title,
    slug: project.slug,
    category: project.category,
    description: project.description,
    case_study: project.case_study ?? "",
    image_url: project.image_url ?? "",
    video_url: project.video_url ?? "",
    technologies: project.technologies.join(", "),
    published: project.published,
  };
}

export default function AdminPage() {
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const getSupabase = () => {
    if (!supabaseRef.current) supabaseRef.current = createClient();
    return supabaseRef.current;
  };
  const supabase = { auth: { signOut: () => getSupabase().auth.signOut() } };
  const [session, setSession] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [form, setForm] = useState<ProjectForm>(emptyForm);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [inquiryLoading, setInquiryLoading] = useState(false);
  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data }) => {
        setSession(Boolean(data.user));
        if (data.user) {
          loadProjects();
          loadInquiries();
        }
      });
  }, []);
  async function loadProjects() {
    const response = await fetch("/api/admin/projects");
    const body = await response.json();
    if (response.ok) setProjects(body.projects);
    else setMessage(body.error);
  }
  async function loadInquiries() {
    setInquiryLoading(true);
    const response = await fetch("/api/admin/inquiries");
    const body = await response.json();
    if (response.ok) setInquiries(body.inquiries);
    else setMessage(body.error);
    setInquiryLoading(false);
  }
  async function sendReply(id: string) {
    if (!replyText.trim()) return;
    setMessage("");
    const response = await fetch(`/api/admin/inquiries/${id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply: replyText }),
    });
    const body = await response.json();
    if (!response.ok) return setMessage(body.error);
    setInquiries((items) => items.map((item) => item.id === id ? { ...item, status: "replied", replied_at: new Date().toISOString() } : item));
    setReplyingTo(null);
    setReplyText("");
    setMessage("Reply sent successfully.");
  }
  async function login(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const { error } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(error.message);
    else {
      setSession(true);
      loadProjects();
    }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    let imageUrl = form.image_url;
    let videoUrl = form.video_url;
    for (const [file, type, setter] of [
      [imageFile, "image", setImageFile],
      [videoFile, "video", setVideoFile],
    ] as const) {
      if (!file) continue;
      const path = `${type}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error } = await getSupabase()
        .storage.from("project-media")
        .upload(path, file, { upsert: false, cacheControl: "31536000" });
      if (error) return setMessage(`Media upload failed: ${error.message}`);
      const { data } = getSupabase()
        .storage.from("project-media")
        .getPublicUrl(path);
      if (type === "image") imageUrl = data.publicUrl;
      else videoUrl = data.publicUrl;
      setter(null);
    }
    const payload = {
      ...form,
      slug: slugify(form.slug || form.title),
      image_url: imageUrl,
      video_url: videoUrl,
      technologies: form.technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };
    const response = await fetch(
      editing ? `/api/projects/${editing}` : "/api/projects",
      {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json();
    if (!response.ok) return setMessage(body.error);
    setForm(emptyForm);
    setEditing(null);
    setMessage("Project saved successfully.");
    loadProjects();
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this project permanently?")) return;
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (response.ok) {
      setProjects((items) => items.filter((item) => item.id !== id));
      setMessage("Project deleted.");
    }
  }
  if (!session)
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={login}>
          <span className="admin-kicker">AutomateIQ CMS</span>
          <h1>Sign in to manage projects</h1>
          <p>Use the Supabase Auth account created for your agency.</p>
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label>
            Password
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="admin-button primary" type="submit">
            Sign in
          </button>
          {message && <div className="admin-message error">{message}</div>}
        </form>
      </main>
    );
  return (
    <main className="admin-shell">
      <div className="admin-wrap">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">AutomateIQ CMS</span>
            <h1>Projects</h1>
            <p>Manage what clients see on your public portfolio.</p>
          </div>
          <button
            className="admin-button"
            onClick={() =>
              supabase.auth.signOut().then(() => setSession(false))
            }
          >
            <LogOut size={16} /> Sign out
          </button>
        </header>
        <section className="inquiry-overview">
          <div className="inquiry-kpi"><Mail size={19} /><div><strong>{inquiries.length}</strong><span>Total inquiries</span></div></div>
          <div className="inquiry-kpi"><Reply size={19} /><div><strong>{inquiries.filter((item) => item.status === "new").length}</strong><span>Awaiting reply</span></div></div>
          <button className="admin-button" onClick={loadInquiries} disabled={inquiryLoading}><RefreshCw size={15} className={inquiryLoading ? "spin" : ""} /> Refresh inbox</button>
        </section>
        <section className="admin-panel inbox-panel">
          <div className="panel-heading"><div><span className="admin-kicker">Client communication</span><h2>Inquiry inbox</h2></div><span>Latest first</span></div>
          <div className="inquiry-list">
            {inquiries.length === 0 && <p className="empty">No inquiries received yet.</p>}
            {inquiries.map((inquiry) => (
              <article className="inquiry-card" key={inquiry.id}>
                <div className="inquiry-card-head"><div><strong>{inquiry.email}</strong><small>{new Date(inquiry.created_at).toLocaleString()}</small></div><span className={`inquiry-status ${inquiry.status}`}>{inquiry.status === "new" ? "New" : "Replied"}</span></div>
                <div className="inquiry-meta"><span>{inquiry.company_size || "Company size not provided"}</span><span>{inquiry.process || "Process not provided"}</span></div>
                {inquiry.message && <p className="inquiry-message">{inquiry.message}</p>}
                {replyingTo === inquiry.id ? (
                  <div className="reply-box"><textarea rows={3} value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write your reply..." /><div><button className="admin-button" onClick={() => { setReplyingTo(null); setReplyText(""); }}>Cancel</button><button className="admin-button primary" onClick={() => sendReply(inquiry.id)}><Mail size={14} /> Send reply</button></div></div>
                ) : <button className="admin-button reply-button" onClick={() => { setReplyingTo(inquiry.id); setReplyText(""); }}><Reply size={14} /> Reply to client</button>}
              </article>
            ))}
          </div>
        </section>
        <div className="admin-layout">
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>{editing ? "Edit project" : "New project"}</h2>
              {editing && (
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm(emptyForm);
                  }}
                  aria-label="Cancel edit"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <form className="project-form" onSubmit={save}>
              <label>
                Title
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </label>
              <label>
                Slug
                <input
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </label>
              <label>
                Category
                <input
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label>
                Technologies <span>(comma separated)</span>
                <input
                  value={form.technologies}
                  onChange={(e) =>
                    setForm({ ...form, technologies: e.target.value })
                  }
                />
              </label>
              <label>
                Cover image URL
                <small>
                  Use a direct image URL ending in .jpg, .png, .webp, or upload
                  a file below. A webpage URL will not work.
                </small>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={(e) =>
                    setForm({ ...form, image_url: e.target.value })
                  }
                />
                <small>Or upload a file</small>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <label>
                Demo video URL
                <small>
                  YouTube links and direct MP4/WebM links are supported.
                </small>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) =>
                    setForm({ ...form, video_url: e.target.value })
                  }
                />
                <small>Or upload MP4/WebM</small>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <label>
                Case study
                <textarea
                  rows={5}
                  value={form.case_study}
                  onChange={(e) =>
                    setForm({ ...form, case_study: e.target.value })
                  }
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                />{" "}
                Publish on website
              </label>
              <button className="admin-button primary" type="submit">
                {editing ? <Save size={16} /> : <Plus size={16} />}{" "}
                {editing ? "Update project" : "Add project"}
              </button>
            </form>
            {message && <div className="admin-message">{message}</div>}
          </section>
          <section className="admin-panel">
            <div className="panel-heading">
              <h2>All projects</h2>
              <span>{projects.length} total</span>
            </div>
            <div className="admin-projects">
              {projects.length === 0 && (
                <p className="empty">
                  No projects yet. Add your first case study.
                </p>
              )}
              {projects.map((project) => (
                <article className="admin-project" key={project.id}>
                  <div>
                    <span className={project.published ? "published" : "draft"}>
                      {project.published ? "Published" : "Draft"}
                    </span>
                    <h3>{project.title}</h3>
                    <p>
                      {project.category} · {project.technologies.join(", ")}
                    </p>
                  </div>
                  <div className="admin-actions">
                    <button
                      onClick={() => {
                        setEditing(project.id);
                        setForm(toForm(project));
                      }}
                      aria-label={`Edit ${project.title}`}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => remove(project.id)}
                      aria-label={`Delete ${project.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
