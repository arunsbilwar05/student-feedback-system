import { useState, useEffect } from 'react';

const api = async (path, { method = 'GET', body, token } = {}) => {
  let r;
  try {
    r = await fetch('/api' + path, {
      method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
      body: body && JSON.stringify(body)
    });
  } catch {
    throw new Error('Could not reach the API server. Make sure the backend is running.');
  }
  let data;
  try {
    data = await r.json();
  } catch {
    throw new Error(r.ok ? 'The API returned an invalid response.' : 'Could not reach the API server. Make sure the backend is running.');
  }
  if (!r.ok) throw new Error(data.error || 'Something went wrong');
  return data;
};

function Login({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = async (e) => {
    e.preventDefault();
    try { onAuth(await api('/auth/' + mode, { method: 'POST', body: f })); } catch (x) { setErr(x.message); }
  };
  return (
    <div className="auth-shell">
      <div className="visual-panel">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
          alt="Students collaborating"
        />
        <div className="visual-badge">
          <strong>99%</strong>
          <span>Student engagement</span>
        </div>
      </div>

      <form className="panel auth-panel" onSubmit={go}>
        <div className="panel-header">
          <p className="eyebrow">Welcome back</p>
          <h2>{mode === 'login' ? 'Sign in' : 'Create student account'}</h2>
        </div>
        {mode === 'register' && <label>Name<input value={f.name} onChange={set('name')} required /></label>}
        <label>Email<input type="email" value={f.email} onChange={set('email')} required /></label>
        <label>Password<input type="password" value={f.password} onChange={set('password')} required /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button>{mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setErr(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
          {mode === 'login' ? 'New student? Create an account' : 'Have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}

function Student({ token }) {
  const [courses, setCourses] = useState([]);
  const [done, setDone] = useState([]);
  const [course, setCourse] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState({ t: '', ok: false });
  const load = () => {
    api('/courses', { token }).then(setCourses);
    api('/feedback/mine', { token }).then((l) => setDone(l.map((x) => x.course)));
  };
  useEffect(load, []);
  const submit = async (e) => {
    e.preventDefault();
    try {
      await api('/feedback', { method: 'POST', token, body: { course, rating, comment } });
      setMsg({ t: 'Feedback submitted. Thank you!', ok: true }); setCourse(''); setRating(0); setComment(''); load();
    } catch (x) { setMsg({ t: x.message, ok: false }); }
  };
  return (
    <div className="dashboard-grid">
      <div className="feature-card feature-illustration">
        <img
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80"
          alt="Academic classroom"
        />
        <div>
          <p className="eyebrow">Student voice</p>
          <h3>Share feedback that shapes better learning.</h3>
        </div>
      </div>

      <form className="panel narrow feedback-panel" onSubmit={submit}>
        <div className="panel-header">
          <p className="eyebrow">Course review</p>
          <h2>Rate a course</h2>
        </div>
        <label>Course
          <select value={course} onChange={(e) => setCourse(e.target.value)} required>
            <option value="">Select a course</option>
            {courses.map((c) => <option key={c._id} value={c._id} disabled={done.includes(c._id)}>
              {c.code} · {c.title} ({c.faculty}){done.includes(c._id) ? ' – reviewed' : ''}</option>)}
          </select>
        </label>
        <fieldset><legend>Rating</legend>
          <div className="stars">{[1, 2, 3, 4, 5].map((n) =>
            <button type="button" key={n} aria-label={n + ' star'} aria-pressed={rating === n}
              className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}>★</button>)}</div>
        </fieldset>
        <label>Comments<textarea rows="4" maxLength="1000" value={comment} onChange={(e) => setComment(e.target.value)}
          placeholder="What worked well? What should change?" /></label>
        {msg.t && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.t}</p>}
        <button disabled={!rating || !course}>Submit feedback</button>
      </form>
    </div>
  );
}

function Admin({ token }) {
  const [sum, setSum] = useState([]);
  const [list, setList] = useState([]);
  useEffect(() => {
    api('/admin/summary', { token }).then(setSum);
    api('/admin/feedback', { token }).then(setList);
  }, []);
  return (
    <div className="admin-layout">
      <div className="feature-card summary-banner">
        <img
          src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"
          alt="Academic team overview"
        />
        <div>
          <p className="eyebrow">Faculty dashboard</p>
          <h3>Track course quality at a glance.</h3>
        </div>
      </div>

      <div className="panel admin-panel">
        <h2>Course results</h2>
        <table><thead><tr><th>Course</th><th>Faculty</th><th>Avg rating</th><th>Responses</th></tr></thead>
          <tbody>{sum.map((s) => <tr key={s._id}><td>{s.code} {s.title}</td><td>{s.faculty}</td>
            <td><b>{s.avg}</b> / 5</td><td>{s.count}</td></tr>)}</tbody></table>
        {!sum.length && <p>No feedback yet.</p>}
        <h2>All comments</h2>
        {list.map((f) => <article key={f._id} className="entry">
          <b>{f.course?.code}</b> · {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} · <small>{f.student?.name}, {new Date(f.createdAt).toLocaleDateString()}</small>
          <p>{f.comment || <i>No comment</i>}</p></article>)}
      </div>
    </div>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem('auth') || 'null'));
  const save = (a) => { if (a) localStorage.setItem('auth', JSON.stringify(a)); else localStorage.removeItem('auth'); setAuth(a); };
  return (
    <div className="page-shell">
      <header>
        <div className="brand-wrap">
          <div className="brand-mark">CF</div>
          <h1>Course Feedback</h1>
        </div>
        {auth && <span className="user-pill">{auth.user.name} · {auth.user.role} <button className="link" onClick={() => save(null)}>Sign out</button></span>}
      </header>
      <main>{!auth ? <Login onAuth={save} /> : auth.user.role === 'admin' ? <Admin token={auth.token} /> : <Student token={auth.token} />}</main>
    </div>
  );
}
