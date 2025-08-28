const letterRepo = require('../repositories/letter.repo');
const mailboxRepo = require('../repositories/mailbox.repo');

async function create({ mailboxId, authorId, title, content, toName, fromName }) {
  if (!mailboxId || !title || !content) {
    const e = new Error('mailboxId,title,content 필요');
    e.status = 400;
    throw e;
  }

  const mb = await mailboxRepo.findById(mailboxId);
  if (!mb) {
    const e = new Error('편지함 없음');
    e.status = 404;
    throw e;
  }

  return letterRepo.create({
    mailboxId: Number(mailboxId),
    authorId: authorId ? Number(authorId) : null,
    title,
    content,
    toName: (toName ?? '').trim() || null,
    fromName: (fromName ?? '').trim() || null,
  });
}

const listInMailbox = (mailboxId, p={}) => letterRepo.findByMailbox(mailboxId, Number(p.limit||50), Number(p.offset||0));
const getById = (id) => letterRepo.findByIdWithMailbox(id);

module.exports = { create, listInMailbox, getById };
