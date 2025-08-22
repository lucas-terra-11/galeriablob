const express = require('express');
const { put, list, del, copy, head } = require('@vercel/blob');
const dotenv = require('dotenv');
const path = require('path');
 
dotenv.config();
const app = express();
 
app.use(express.json());
 
app.post('/api/upload', async (req, res) => {
  const filename = req.headers['x-vercel-filename'];
  if (!filename) {
    return res.status(400).json({ message: 'O nome do arquivo é obrigatório no cabeçalho x-vercel-filename.' });
  }
 
  try {
    const blob = await put(filename, req, {
      access: 'public',
    });
    res.status(200).json(blob);
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ message: 'Erro ao fazer upload do arquivo.', error: error.message });
  }
});
 
app.get('/api/files', async (req, res) => {
  try {
    const { blobs } = await list();
    res.status(200).json(blobs);
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    res.status(500).json({ message: 'Erro ao buscar a lista de arquivos.', error: error.message });
  }
});
 
app.post('/api/delete', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ message: 'Informe url.' });
 
    await del(url, {
    });
 
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ message: 'Erro ao excluir arquivo.', error: error.message });
  }
});
 
app.post('/api/rename', async (req, res) => {
  try {
    const { pathname, newName } = req.body;
    if (!pathname || !newName) {
      return res.status(400).json({ message: 'Informe pathname e newName.' });
    }
 
    const lastSlash = pathname.lastIndexOf('/');
    const prefix = lastSlash >= 0 ? pathname.slice(0, lastSlash + 1) : '';
 
    const ext = path.extname(pathname);
    const base = newName.trim().replace(/[\\/]/g, '');
    const hasExt = path.extname(base) !== '';
    const finalPathname = prefix + (hasExt ? base : base + ext);
 
    console.log('Renomeando:', pathname, '->', finalPathname);
 
    const newBlob = await copy(pathname, finalPathname, { access: 'public' });
 
    await del(pathname);
 
    res.status(200).json(newBlob);
  } catch (error) {
    console.error('Erro ao renomear:', error);
    res.status(500).json({ message: 'Erro ao renomear arquivo.', error: error.message });
  }
});
 
// Estáticos
app.use(express.static(path.join(__dirname, 'public')));
 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
 