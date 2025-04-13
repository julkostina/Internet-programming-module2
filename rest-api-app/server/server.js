const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const { parseStringPromise, Builder } = require('xml2js'); // Import xml2js for XML parsing and building

const app = express();
const PORT = 3000;
const DATA_FILE_JSON = path.join(__dirname, '../data/data.json');
const DATA_FILE_XML = path.join(__dirname, '../data/data.xml');
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, '../public')));

// Helper function to read JSON data
async function readJSONData() {
    try {
        const data_json = await fs.readFile(DATA_FILE_JSON, 'utf8');
        return JSON.parse(data_json);
    } catch (error) {
        console.error('Error reading JSON data:', error);
        return [];
    }
}

async function readXMLData() {
    try {
        const data_xml = await fs.readFile(DATA_FILE_XML, 'utf8');

        // Check if the file is empty
        if (!data_xml.trim()) {
            return []; // Return an empty array if the XML file is empty
        }

        const parsedData = await parseStringPromise(data_xml);

        // Check if the structure exists and has records
        if (!parsedData.records || !parsedData.records.record) {
            return []; // Return an empty array if no records are found
        }

        return parsedData.records.record.map(record => ({
            id: record.id[0],
            name: record.name[0],
            email: record.email[0],
        }));
    } catch (error) {
        console.error('Error reading XML data:', error);
        return [];
    }
}

// Helper function to write JSON data
async function writeJSONData(data) {
    try {
        await fs.writeFile(DATA_FILE_JSON, JSON.stringify(data, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing JSON data:', error);
    }
}

// Helper function to write XML data
async function writeXMLData(data) {
    try {
        const builder = new Builder();
        const xml = builder.buildObject({ records: { record: data } });
        await fs.writeFile(DATA_FILE_XML, xml, 'utf8');
    } catch (error) {
        console.error('Error writing XML data:', error);
    }
}

// --- REST API Endpoints ---

// GET /api/records: Read all records (from both JSON and XML)
app.get('/api/records', async (req, res) => {
    const jsonRecords = await readJSONData();
    const xmlRecords = await readXMLData();
    res.json({ json: jsonRecords, xml: xmlRecords });
});

// POST /api/records: Create a new record (in both JSON and XML)
app.post('/api/records', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    const newId = Date.now().toString(); // Simple way to generate a unique ID
    const newRecord = { id: newId, name, email };

    // Update JSON data
    const jsonRecords = await readJSONData();
    jsonRecords.push(newRecord);
    await writeJSONData(jsonRecords);

    // Update XML data
    const xmlRecords = await readXMLData();
    xmlRecords.push(newRecord);
    await writeXMLData(xmlRecords);

    res.status(201).json(newRecord); // 201 Created status
});

// PUT /api/records/:id: Update an existing record (in both JSON and XML)
app.put('/api/records/:id', async (req, res) => {
    const id = req.params.id;
    const { name, email } = req.body;

    // Update JSON data
    const jsonRecords = await readJSONData();
    const jsonRecordIndex = jsonRecords.findIndex(r => r.id === id);
    if (jsonRecordIndex !== -1) {
        jsonRecords[jsonRecordIndex] = { ...jsonRecords[jsonRecordIndex], name, email };
        await writeJSONData(jsonRecords);
    }

    // Update XML data
    const xmlRecords = await readXMLData();
    const xmlRecordIndex = xmlRecords.findIndex(r => r.id === id);
    if (xmlRecordIndex !== -1) {
        xmlRecords[xmlRecordIndex] = { ...xmlRecords[xmlRecordIndex], name, email };
        await writeXMLData(xmlRecords);
    }

    if (jsonRecordIndex !== -1 || xmlRecordIndex !== -1) {
        res.json({ message: 'Record updated successfully' });
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
});

// DELETE /api/records/:id: Delete a record (from both JSON and XML)
app.delete('/api/records/:id', async (req, res) => {
    const id = req.params.id;

    // Delete from JSON data
    const jsonRecords = await readJSONData();
    const updatedJSONRecords = jsonRecords.filter(r => r.id !== id);
    await writeJSONData(updatedJSONRecords);

    // Delete from XML data
    const xmlRecords = await readXMLData();
    const updatedXMLRecords = xmlRecords.filter(r => r.id !== id);
    await writeXMLData(updatedXMLRecords);

    if (jsonRecords.length > updatedJSONRecords.length || xmlRecords.length > updatedXMLRecords.length) {
        res.json({ message: 'Record deleted successfully' });
    } else {
        res.status(404).json({ message: 'Record not found' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});