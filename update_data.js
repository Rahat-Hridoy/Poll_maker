
const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data.json');

try {
    if (fs.existsSync(dataPath)) {
        const fileData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(fileData);

        const pres1 = {
            id: 'pres-1',
            title: 'Q&A Demo',
            slides: [
                {
                    id: 'slide-1',
                    layout: 'title',
                    content: JSON.stringify([
                        {
                            id: 'el-1',
                            type: 'text',
                            x: 100,
                            y: 100,
                            width: 800,
                            height: 200,
                            rotation: 0,
                            content: '<h1>Welcome to Q&A</h1><p>Scan the code to ask questions</p>',
                            style: {
                                fontSize: '48px',
                                textAlign: 'center',
                                color: '#000000'
                            }
                        }
                    ]),
                    type: 'title'
                },
                {
                    id: 'slide-2',
                    layout: 'qa',
                    content: JSON.stringify([
                        {
                            id: 'el-2',
                            type: 'qa-template',
                            x: 0,
                            y: 0,
                            width: 1000,
                            height: 562.5,
                            rotation: 0,
                            content: JSON.stringify({
                                title: "Q&A Session",
                                subtitle: "Ask away!",
                                showQR: true
                            })
                        }
                    ]),
                    type: 'qa-template'
                }
            ],
            theme: 'default',
            shortCode: '123456',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            qaSessions: {} 
        };

        // Remove existing pres-1 if it exists
        data.presentations = data.presentations.filter(p => p.id !== 'pres-1');
        
        // Add pres-1
        data.presentations.push(pres1);

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        console.log('Successfully updated data.json with pres-1 (corrected structure)');
    } else {
        console.error('data.json not found!');
    }
} catch (error) {
    console.error('Error updating data.json:', error);
}
