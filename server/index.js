import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { db, initDb } from './store.js';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '1mb' }));
initDb();

const ai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const languages = new Set(['en', 'ta', 'hi', 'te', 'ml', 'kn']);
const languageNames = { en:'English', ta:'Tamil', hi:'Hindi', te:'Telugu', ml:'Malayalam', kn:'Kannada' };

app.get('/api/health', (_req,res) => res.json({ok:true, service:'Upscale Info Hub API', aiEnabled:Boolean(ai)}));

app.get('/api/jobs', (req,res) => {
  const q = String(req.query.q || '').trim().slice(0,100);
  const rows = q
    ? db.prepare(`SELECT * FROM jobs WHERE status='open' AND (title LIKE ? OR description LIKE ? OR location LIKE ?) ORDER BY created_at DESC`).all(`%${q}%`,`%${q}%`,`%${q}%`)
    : db.prepare(`SELECT * FROM jobs WHERE status='open' ORDER BY created_at DESC`).all();
  res.json(rows);
});
app.post('/api/jobs', (req,res) => {
  const {title,description='',location='',pay='',createdBy='demo'} = req.body || {};
  if (!String(title||'').trim() || !String(location||'').trim()) return res.status(400).json({error:'Title and location are required.'});
  const result = db.prepare(`INSERT INTO jobs(title,description,location,pay,created_by,status,created_at) VALUES(?,?,?,?,?,'open',datetime('now'))`)
    .run(String(title).trim().slice(0,100),String(description).slice(0,1000),String(location).trim().slice(0,120),String(pay).slice(0,80),String(createdBy).slice(0,120));
  res.status(201).json(db.prepare('SELECT * FROM jobs WHERE id=?').get(result.lastInsertRowid));
});
app.get('/api/profiles', (_req,res) => res.json(db.prepare('SELECT id,name,role,skills,location,availability,created_at FROM profiles ORDER BY created_at DESC').all()));
app.post('/api/profiles', (req,res) => {
  const {name,role,skills='',location='',availability='Available'} = req.body || {};
  if (!String(name||'').trim() || !['Worker','Farmer','Seller','Community member'].includes(role)) return res.status(400).json({error:'A name and valid role are required.'});
  const result = db.prepare(`INSERT INTO profiles(name,role,skills,location,availability,created_at) VALUES(?,?,?,?,?,datetime('now'))`)
    .run(String(name).trim().slice(0,100),role,String(skills).slice(0,300),String(location).slice(0,120),String(availability).slice(0,60));
  res.status(201).json(db.prepare('SELECT id,name,role,skills,location,availability,created_at FROM profiles WHERE id=?').get(result.lastInsertRowid));
});
app.get('/api/sellers', (_req,res) => res.json(db.prepare('SELECT * FROM sellers ORDER BY name').all()));
app.post('/api/enquiries', (req,res) => {
  const {sellerId,name,message,contact=''} = req.body || {};
  if (!sellerId || !String(name||'').trim() || !String(message||'').trim()) return res.status(400).json({error:'Seller, name and message are required.'});
  const result = db.prepare(`INSERT INTO enquiries(seller_id,name,message,contact,status,created_at) VALUES(?,?,?,?, 'new',datetime('now'))`)
    .run(Number(sellerId),String(name).trim().slice(0,100),String(message).trim().slice(0,1000),String(contact).slice(0,120));
  res.status(201).json({id:result.lastInsertRowid,status:'received',message:'Your enquiry was saved. The seller has not been notified automatically.'});
});
app.post('/api/assistant', async (req,res) => {
  const text = String(req.body?.text || '').trim().slice(0,2000);
  const language = languages.has(req.body?.language) ? req.body.language : 'en';
  if (!text) return res.status(400).json({error:'Please enter or speak a request.'});
  const context = `You are the helpful assistant for Upscale Info Hub, a community platform connecting local workers, farmers and sellers. Reply in ${languageNames[language]}. Keep the answer short and practical. Help with navigating sample jobs, worker profiles, general farming knowledge, and seller enquiries. Do not claim to have booked jobs, contacted sellers, verified users, or accessed live local data. For crop or pesticide decisions, encourage checking local agricultural experts and product labels. Government scheme eligibility matching is not part of this product. User request: ${text}`;
  if (!ai) {
    const low = text.toLowerCase();
    let reply = 'You can explore WorkLink for local jobs, Farmer Future for practical farming topics, or the seller directory for supply and buyer connections.';
    if (/(job|work|worker|labour|labor)/.test(low)) reply = 'Open WorkLink and search the available sample jobs. In the full app, you will be able to filter jobs by skill and area.';
    else if (/(farm|crop|soil|water|pest)/.test(low)) reply = 'Open Farmer Future for general topics. For advice specific to your crop and location, confirm with a trusted local agricultural expert.';
    else if (/(seller|market|buyer|supply|seed)/.test(low)) reply = 'Open the seller directory to browse example suppliers and buyers, then use the enquiry form.';
    return res.json({reply,mode:'rule-based-fallback',language});
  }
  try {
    const completion = await ai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages:[{role:'system',content:context}],
      temperature:0.4,
      max_tokens:220
    });
    res.json({reply:completion.choices[0]?.message?.content || 'Please try again.',mode:'ai',language});
  } catch (e) {
    console.error('Assistant error:',e.message);
    res.status(502).json({error:'AI assistant is temporarily unavailable. Please try again.'});
  }
});

app.use(express.static('dist'));
app.listen(PORT, () => console.log(`Upscale Info Hub API listening on http://localhost:${PORT}`));