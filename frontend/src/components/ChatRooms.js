import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ChatRooms = () => {
    const [rooms] = useState([
        { id: 'general', name: 'General Discussion', description: 'Open chat for everyone' },
        { id: 'project-help', name: 'Project Help', description: 'Get help with your projects' },
        { id: 'random', name: 'Random', description: 'Random conversations' }
    ]);
    
    const [newRoomName, setNewRoomName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleCreateRoom = (e) => {
        e.preventDefault();
        if (newRoomName.trim()) {
            const roomId = newRoomName.toLowerCase().replace(/\s+/g, '-');
            window.location.href = `/chat/${roomId}`;
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Chat Rooms</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    Create Room
                </button>
            </div>

            {showCreateForm && (
                <div className="card mb-4">
                    <div className="card-body">
                        <form onSubmit={handleCreateRoom}>
                            <div className="mb-3">
                                <label className="form-label">Room Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="Enter room name"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-success me-2">
                                Create & Join
                            </button>
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="row">
                {rooms.map((room) => (
                    <div key={room.id} className="col-md-4 mb-3">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">{room.name}</h5>
                                <p className="card-text">{room.description}</p>
                                <Link 
                                    to={`/chat/${room.id}`} 
                                    className="btn btn-primary"
                                >
                                    Join Room
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatRooms;
