import React, { useEffect, useState } from 'react';

const StudentChatPanel = ({ socket, gradeFromLogin = '', sectionFromLogin = '' }) => {
    const [grade, setGrade] = useState(gradeFromLogin);
    const [section, setSection] = useState(sectionFromLogin);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if(!socket) return
        const handleMessage = (event) => {
            const data = JSON.parse(event.data);
            if (
                data.type === "public_message_from_staff" ||
                data.type === "private_message_from_staff"
            ) {
                setMessages(prev => [...prev, { from: "staff", text: data.message }]);
            }
        };

        if (socket) {
            socket.addEventListener("message", handleMessage);
        }

        return () => {
            if (socket) socket.removeEventListener("message", handleMessage);
        };
    }, [socket]);

    const handleSend = () => {
        if (!input.trim()) return;

        const payload = {
            type: "private_msg_to_staff",
            grade,
            section,
            auth: "student",
            message: input
        };

        socket.send(JSON.stringify(payload));
        setMessages(prev => [...prev, { from: "me", text: input }]);
        setInput('');
    };

    return (
        <div style={styles.container}>
            {!grade || !section ? (
                <div style={styles.setup}>
                    <input
                        placeholder="Enter Grade"
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                    />
                    <input
                        placeholder="Enter Section"
                        value={section}
                        onChange={e => setSection(e.target.value)}
                    />
                </div>
            ) : (
                <>
                    <h3>Chat with Your Assigned Staff</h3>
                    <div style={styles.chatBox}>
                        <div style={styles.chatLog}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.message,
                                        alignSelf: msg.from === 'me' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        backgroundColor: msg.from === 'me' ? '#dcf8c6' : '#f1f0f0',
                                        padding: '8px 12px',
                                        borderRadius: '10px',
                                        maxWidth: '60%',
                                    }}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div style={styles.inputRow}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type message..."
                                style={styles.input}
                            />
                            <button onClick={handleSend}>Send</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '1rem',
        maxWidth: '600px',
        margin: 'auto',
    },
    setup: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1rem',
    },
    chatBox: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        height: '400px',
    },
    chatLog: {
        flex: 1,
        padding: '1rem',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    inputRow: {
        display: 'flex',
        borderTop: '1px solid #ccc',
    },
    input: {
        flex: 1,
        padding: '0.5rem',
        border: 'none',
        outline: 'none',
    },
    message: {
        display: 'flex',
    },
};

export default StudentChatPanel;
