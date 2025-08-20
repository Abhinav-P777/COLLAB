import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import axios from 'axios';

const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [user, setUser] = useState(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Get user from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            window.location.href = '/login';
            return;
        }
        setUser(userData);

        // Initialize socket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join chat room
        newSocket.emit('joinChatRoom', {
            roomId,
            userId: userData.userId || 'anonymous',
            username: userData.username
        });

        // Load existing messages
        fetchMessages();

        // Listen for new messages
        newSocket.on('receiveChatMessage', (message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('userJoined', (data) => {
            setMessages(prev => [...prev, {
                _id: Date.now(),
                message: data.message,
                messageType: 'system',
                createdAt: data.timestamp
            }]);
        });

        newSocket.on('userLeft', (data) => {
            setMessages(prev => [...prev, {
                _id: Date.now(),
                message: data.message,
                messageType: 'system',
                createdAt: data.timestamp
            }]);
        });

        return () => {
            newSocket.emit('leaveChatRoom', {
                roomId,
                username: userData.username
            });
            newSocket.disconnect();
        };
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('user'));
            const { data } = await axios.get(`http://localhost:5000/api/chat/room/${roomId}`, {
                headers: { Authorization: `Bearer ${userData.token}` }
            });
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socket && user) {
            socket.emit('sendChatMessage', {
                roomId,
                message: newMessage,
                userId: user.userId || 'anonymous',
                username: user.username
            });
            setNewMessage('');
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    return (
        <div className="container-fluid h-100">
            <div className="row h-100">
                <div className="col-md-12">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0">Chat Room: {roomId}</h5>
                        </div>
                        
                        <div className="card-body d-flex flex-column" style={{ height: 'calc(100vh - 200px)' }}>
                            {/* Messages Area */}
                            <div className="flex-grow-1 overflow-auto mb-3" style={{ maxHeight: '70vh' }}>
                                {messages.map((message) => (
                                    <div key={message._id} className="mb-2">
                                        {message.messageType === 'system' ? (
                                            <div className="text-center text-muted small">
                                                <em>{message.message}</em>
                                            </div>
                                        ) : (
                                            <div className={`d-flex ${message.sender?.name === user?.username ? 'justify-content-end' : 'justify-content-start'}`}>
                                                <div className={`p-2 rounded max-width-75 ${
                                                    message.sender?.name === user?.username 
                                                        ? 'bg-primary text-white' 
                                                        : 'bg-light'
                                                }`}>
                                                    <div className="fw-bold small">
                                                        {message.sender?.name || 'Anonymous'}
                                                    </div>
                                                    <div>{message.message}</div>
                                                    <div className="text-end small opacity-75">
                                                        {formatTime(message.createdAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Message Input */}
                            <form onSubmit={sendMessage} className="d-flex">
                                <input
                                    type="text"
                                    className="form-control me-2"
                                    placeholder="Type a message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary">
                                    Send
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatRoom;
