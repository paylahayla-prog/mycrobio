
import React from 'react';

export const TypingIndicator: React.FC = () => {
    return (
        <div className="p-3 rounded-lg max-w-md shadow-md bg-[#161b22] border border-[#30363d] self-start">
            <div className="flex items-center p-3">
                <div className="typing-indicator">
                    <span className="h-2 w-2 bg-gray-400 rounded-full inline-block mx-0.5"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full inline-block mx-0.5"></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full inline-block mx-0.5"></span>
                </div>
            </div>
        </div>
    );
};
