const service = require('../services/mailbox.service');

const create = async (req,res,next)=>{ try{
  const { name, type, lat, lng, password, hint } = req.body;
  const r = await service.createMailbox({ name, type, lat, lng, password, hint });
  res.status(201).json(r);
}catch(e){ next(e); }};

const list = async (req,res,next)=>{ try{
  const { lat, lng, radius } = req.query;
  if (lat==null || lng==null){ const e = new Error('lat,lng 필요'); e.status=400; throw e; }
  const items = await service.listNearby({ lat, lng, radius });
  res.json({ items });
}catch(e){ next(e); }};

const gate = async (req,res,next)=>{ try{
  const { id } = req.params;
  const { lat, lng, password } = req.body;
  if (lat==null || lng==null){ const e = new Error('현재 위치(lat,lng) 필요'); e.status=400; throw e; }
  const r = await service.gate({ mailboxId:id, userLat:lat, userLng:lng, password });
  res.json(r);
}catch(e){ next(e); }};

module.exports = { create, list, gate };
