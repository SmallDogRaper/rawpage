const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

const commentsFile = path.join(__dirname, 'comments.json');
const drawingsDir = path.join(__dirname, 'public', 'drawings');

async function initialize() {
    try {
        await fs.access(commentsFile);
    } catch {
        await fs.writeFile(commentsFile, '[]');
    }
    try {
        await fs.access(drawingsDir);
    } catch {
        await fs.mkdir(drawingsDir);
    }
}

app.get('/comments', async (req, res) => {
    try {
        const data = await fs.readFile(commentsFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (err) {
        console.error('Error reading comments:', err);
        res.status(500).send('Error reading comments');
    }
});

app.post('/comments', async (req, res) => {
    try {
        const newEntry = req.body;
        const data = await fs.readFile(commentsFile, 'utf8');
        const comments = JSON.parse(data);
        comments.unshift(newEntry);
        await fs.writeFile(commentsFile, JSON.stringify(comments, null, 2));
        res.json(comments);
    } catch (err) {
        console.error('Error saving comment:', err);
        res.status(500).send('Error saving comment');
    }
});

app.post('/drawings', async (req, res) => {
    try {
        const { dataUrl, timestamp } = req.body;
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        const filename = `${timestamp}.jpg`;
        await fs.writeFile(path.join(drawingsDir, filename), base64Data, 'base64');
        res.json({ filename });
    } catch (err) {
        console.error('Error saving drawing:', err);
        res.status(500).send('Error saving drawing');
    }
});

initialize().then(() => {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
});