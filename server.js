const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.static('public'));
app.use(express.json());

// Supabase setup
const supabaseUrl = 'https://xiluolchyuvpizkiyxgk.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbHVvbGNoeXV2cGl6a2l5eGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDA3OTAsImV4cCI6MjA1ODY3Njc5MH0.6sdvGIsoMZDY5kJ8NOCbbtU8XGFFJNihlRPRKeHLOuE'; 
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/comments', async (req, res) => {
    const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('id', { ascending: false }); // Newest first
    if (error) return res.status(500).send('Error fetching comments');
    res.json(data);
});

app.post('/comments', async (req, res) => {
    const { text, drawing, timestamp } = req.body;
    const { error } = await supabase
        .from('comments')
        .insert([{ text, drawing, timestamp }]);
    if (error) return res.status(500).send('Error saving comment');
    res.sendStatus(200);
});

app.post('/drawings', async (req, res) => {
    const { dataUrl, timestamp } = req.body;
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const { error } = await supabase.storage
        .from('drawings')
        .upload(`${timestamp}.jpg`, buffer, { contentType: 'image/jpeg' });
    if (error) return res.status(500).send('Error saving drawing');
    res.sendStatus(200);
});

app.post('/upload', async (req, res) => {
    const { dataUrl, timestamp } = req.body;
    const data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    const { error } = await supabase.storage
        .from('drawings')
        .upload(`${timestamp}.jpg`, buffer, { contentType: 'image/jpeg' });
    if (error) return res.status(500).send('Error saving upload');
    res.sendStatus(200);
});
console.log('woof!');
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));
