const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const supabaseUrl = 'https://xiluolchyuvpizkiyxgk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpbHVvbGNoeXV2cGl6a2l5eGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMDA3OTAsImV4cCI6MjA1ODY3Njc5MH0.6sdvGIsoMZDY5kJ8NOCbbtU8XGFFJNihlRPRKeHLOuE';
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/comments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*')
            .order('id', { ascending: false });
        if (error) throw error;
        console.log('Fetched comments:', data);
        res.json(data);
    } catch (error) {
        console.error('GET /comments error:', error.message);
        res.status(500).send('Error fetching comments');
    }
});

app.post('/comments', async (req, res) => {
    try {
        const { text, drawing, timestamp } = req.body;
        console.log('Posting comment:', { text, drawing, timestamp });
        const { error } = await supabase
            .from('comments')
            .insert([{ text, drawing, timestamp }]);
        if (error) throw error;
        console.log('Comment saved to Supabase');
        res.sendStatus(200);
    } catch (error) {
        console.error('POST /comments error:', error.message);
        res.status(500).send('Error saving comment');
    }
});

app.post('/drawings', async (req, res) => {
    try {
        const { dataUrl, timestamp } = req.body;
        console.log('Posting drawing:', timestamp);
        if (!dataUrl || !timestamp) throw new Error('Missing dataUrl or timestamp');
        const data = dataUrl.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(data, 'base64');
        console.log('Uploading to Supabase Storage...');
        const { data: uploadData, error } = await supabase.storage
            .from('drawings')
            .upload(`${timestamp}.jpg`, buffer, { contentType: 'image/jpeg' });
        if (error) throw error;
        console.log('Drawing uploaded to Supabase:', uploadData);
        res.sendStatus(200);
    } catch (error) {
        console.error('POST /drawings error:', error.message);
        res.status(500).send('Error saving drawing');
    }
});

console.log('woof!');
app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));
