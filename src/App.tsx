import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Camera, Check, Moon, Plus, Sun, Trash2, X } from 'lucide-react';
import { getEntries, removeEntry, saveEntry, type GratitudeEntry } from './db';

type Screen = 'home' | 'form' | 'detail';
const today = () => new Date().toISOString().slice(0, 10);
const blank = (): GratitudeEntry => ({
  id: crypto.randomUUID(), title: '', description: '', memoryDate: today(),
  createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
});

export default function App() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [screen, setScreen] = useState<Screen>('home');
  const [draft, setDraft] = useState<GratitudeEntry>(blank());
  const [selected, setSelected] = useState<GratitudeEntry | null>(null);
  const [dark, setDark] = useState(false);
  const [showMemory, setShowMemory] = useState<GratitudeEntry | null>(null);
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const visibleEntries = useMemo(() => entries.filter(entry =>
    `${entry.title} ${entry.description}`.toLowerCase().includes(query.trim().toLowerCase())
  ), [entries, query]);

  const refresh = async () => setEntries(await getEntries());
  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    if (!entries.length) return;
    const last = localStorage.getItem('lastRandomMemoryDay');
    const day = today();
    if (last !== day && Math.random() < 0.22) {
      const pick = entries[Math.floor(Math.random() * entries.length)];
      setShowMemory(pick);
      localStorage.setItem('lastRandomMemoryDay', day);
    }
  }, [entries]);

  const openNew = () => { setDraft(blank()); setScreen('form'); };
  const openEdit = (entry: GratitudeEntry) => { setDraft({ ...entry }); setSelected(entry); setScreen('form'); };
  const goHome = () => { setScreen('home'); setSelected(null); };
  const update = (patch: Partial<GratitudeEntry>) => setDraft(d => ({ ...d, ...patch }));
  const onImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setNotice('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setNotice('Please choose an image smaller than 5 MB.'); return; }
    const reader = new FileReader();
    reader.onload = () => update({ image: String(reader.result) });
    reader.readAsDataURL(file);
  };
  const save = async () => {
    if (!draft.title.trim()) { setNotice('Please add a title first.'); return; }
    await saveEntry({ ...draft, title: draft.title.trim(), updatedAt: new Date().toISOString() });
    await refresh(); goHome(); setNotice('Your memory has been saved.');
  };
  const del = async () => {
    if (!selected) return;
    if (!window.confirm('Permanently delete this gratitude memory?')) return;
    await removeEntry(selected.id); await refresh(); goHome(); setNotice('Memory deleted.');
  };
  const hasChanges = useMemo(() => {
    if (!selected) return !!(draft.title || draft.description || draft.image);
    return JSON.stringify(draft) !== JSON.stringify(selected);
  }, [draft, selected]);
  const backFromForm = () => {
    if (hasChanges && !window.confirm('Discard your unsaved changes?')) return;
    goHome();
  };

  return <main className={dark ? 'app dark' : 'app'}>
    <header className="topbar">
      {screen !== 'home' ? <button className="icon-btn" onClick={() => screen === 'form' ? backFromForm() : goHome()} aria-label="Back"><ArrowLeft /></button> : <span className="brand-mark">✳</span>}
      <div className="top-actions">
        <button className="icon-btn" onClick={() => setDark(v => !v)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button>
        {screen === 'form' && <button className="save-top" onClick={() => void save()}><Check size={17}/> Save</button>}
      </div>
    </header>

    {screen === 'home' && <section className="home">
      <div className="home-heading">
        <div>
          <p className="eyebrow">A LITTLE SPACE FOR THE GOOD THINGS</p>
          <h1>things I am<br/><em>grateful for..</em></h1>
          <p className="intro">Small moments. Big feelings. Memories worth keeping.</p>
        </div>
        <div className="home-art" role="img" aria-label="A sunlit vase of flowers on a table"><span>✿</span><i>✿</i></div>
      </div>
      <div className="list-heading"><span>Your gratitude list</span><span>{entries.length} {entries.length === 1 ? 'memory' : 'memories'}</span></div>
      {entries.length > 0 && <label className="search-box"><span>⌕</span><input aria-label="Search memories" value={query} onChange={e => setQuery(e.target.value)} placeholder="Find a memory"/><kbd>/</kbd></label>}
      {entries.length === 0 ? <div className="empty">
        <div className="empty-flower">✿</div><h2>Your story starts here</h2>
        <p>Add the first little thing you're grateful for today.</p>
        <button className="primary" onClick={openNew}><Plus size={18}/> Add a memory</button>
      </div> : visibleEntries.length === 0 ? <div className="no-results">No memories match “{query}”.</div> : <div className="cards">
        {visibleEntries.map((entry, i) => <button className={`memory-card tint-${i % 4}`} key={entry.id} onClick={() => { setSelected(entry); setScreen('detail'); }}>
          {entry.image ? <img className="card-image" src={entry.image} alt=""/> : <div className="card-image image-placeholder">✿</div>}
          <span className="card-copy"><strong>{entry.title}</strong><small>{new Date(entry.memoryDate + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</small></span>
          <span className="card-arrow">↗</span>
        </button>)}
      </div>}
      <button className="add-fab" onClick={openNew} aria-label="Add gratitude"><Plus/></button>
    </section>}

    {screen === 'form' && <section className="editor">
      <p className="eyebrow">{selected ? 'A MEMORY TO KEEP' : 'SAVE A LITTLE JOY'}</p>
      <h1>{selected ? 'Edit memory' : 'A new gratitude'}</h1>
      <label className="photo-picker">
        {draft.image ? <img src={draft.image} alt="Selected memory"/> : <span className="photo-empty"><Camera size={25}/><span>Add a picture</span><small>Choose from gallery or take a photo</small></span>}
        <input type="file" accept="image/*" capture="environment" onChange={e => onImage(e.target.files?.[0])}/>
      </label>
      {draft.image && <button className="remove-photo" onClick={() => update({ image: undefined })}><X size={14}/> Remove picture</button>}
      <label className="field"><span>What are you grateful for? <b>*</b></span><input autoFocus maxLength={100} value={draft.title} placeholder="A person, a moment, a little thing..." onChange={e => update({ title: e.target.value })}/></label>
      <label className="field"><span>Tell the story <small>Optional</small></span><textarea rows={5} maxLength={1500} value={draft.description} placeholder="What made this moment special?" onChange={e => update({ description: e.target.value })}/></label>
      <label className="field"><span>Memory date</span><input type="date" value={draft.memoryDate} onChange={e => update({ memoryDate: e.target.value })}/></label>
      <div className="editor-actions">
        <button className="quiet" onClick={backFromForm}>Cancel</button>
        {selected && <button className="delete" onClick={() => void del()}><Trash2 size={16}/> Delete</button>}
      </div>
    </section>}

    {screen === 'detail' && selected && <section className="detail">
      <p className="eyebrow">A MOMENT TO REMEMBER</p>
      <h1>{selected.title}</h1>
      <p className="detail-date">{new Date(selected.memoryDate + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      {selected.image && <img className="detail-image" src={selected.image} alt="Gratitude memory"/>}
      {selected.description && <p className="detail-description">{selected.description}</p>}
      <button className="primary" onClick={() => openEdit(selected)}>Edit memory</button>
    </section>}

    {notice && <button className="toast" onClick={() => setNotice('')}>{notice} <X size={14}/></button>}
    {showMemory && <div className="modal-backdrop" onClick={() => setShowMemory(null)}><div className="memory-modal" onClick={e => e.stopPropagation()}>
      <button className="modal-close" onClick={() => setShowMemory(null)}><X/></button><p className="eyebrow">A LITTLE MEMORY FOR TODAY</p><h2>{showMemory.title}</h2>
      {showMemory.image && <img src={showMemory.image} alt=""/>}
      {showMemory.description && <p>{showMemory.description}</p>}
      <button className="primary" onClick={() => { setSelected(showMemory); setShowMemory(null); setScreen('detail'); }}>Visit this memory</button>
    </div></div>}
    <footer>Made with a grateful heart <span>♡</span></footer>
  </main>;
}