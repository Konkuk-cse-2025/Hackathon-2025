// src/controllers/letter.controller.js
const svc = require('../services/letter.service');
const mailboxSvc = require('../services/mailbox.service');

const create = async (req,res,next)=>{ try{
  const { mailboxId, title, content, lat, lng, password } = req.body;
  if (lat==null || lng==null) { const e = new Error('현재 위치(lat,lng)가 필요합니다.'); e.status=400; throw e; }
  // 거리 + (SECRET이면) 비번 즉시 검증
  await mailboxSvc.requireAccessSimple({ mailboxId, userLat:lat, userLng:lng, password });

  const authorId = req.user?.id || null; // 로그인 연동 원하면 optionalAuth 사용
  const r = await svc.create({ mailboxId, title, content, authorId });
  res.status(201).json(r);
}catch(e){ next(e); }};

const listInMailbox = async (req,res,next)=>{ try{
  const { id } = req.params;
  const { lat, lng, password, limit, offset } = req.query;
  if (lat==null || lng==null) { const e = new Error('현재 위치(lat,lng)가 필요합니다.'); e.status=400; throw e; }
  await mailboxSvc.requireAccessSimple({ mailboxId:id, userLat:lat, userLng:lng, password });
  const items = await svc.listInMailbox(id, { limit, offset });
  res.json({ items });
}catch(e){ next(e); }};

const getOne = async (req,res,next)=>{ try{
  const { id } = req.params;
  const { lat, lng, password } = req.query;
  if (lat==null || lng==null) { const e = new Error('현재 위치(lat,lng)가 필요합니다.'); e.status=400; throw e; }

  const letter = await svc.getById(id);
  if (!letter) { const e = new Error('존재하지 않는 편지입니다.'); e.status=404; throw e; }

  await mailboxSvc.requireAccessSimple({
    mailboxId: letter.mailboxId,
    userLat: lat,
    userLng: lng,
    password
  });

  res.json(letter);
}catch(e){ next(e); }};

module.exports = { create, listInMailbox, getOne };
