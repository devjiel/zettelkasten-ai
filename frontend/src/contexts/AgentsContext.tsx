import React, { createContext, useContext } from 'react';
import { WebExtractInput, BookSummaryInput } from '../types';
import api from '../services/api';

interface AgentsContextData {
    runBookSummary: (input: BookSummaryInput) => Promise<{ taskId: string }>;
    runWebExtract: (input: WebExtractInput) => Promise<{ taskId: string }>;
    getTaskStatus: (taskId: string) => Promise<any>;
}

const AgentsContext = createContext<AgentsContextData>({} as AgentsContextData);

export const AgentsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const runBookSummary = async (input: BookSummaryInput) => {
        const response = await api.post('/agents/book-summary', input);
        return response.data;
    };

    const runWebExtract = async (input: WebExtractInput) => {
        const response = await api.post('/agents/web-extract', input);
        return response.data;
    };

    const getTaskStatus = async (taskId: string) => {
        const response = await api.get(`/agents/tasks/${taskId}`);
        return response.data;
    };

    return (
        <AgentsContext.Provider
            value={{
                runBookSummary,
                runWebExtract,
                getTaskStatus,
            }}
        >
            {children}
        </AgentsContext.Provider>
    );
};

export const useAgents = () => {
    const context = useContext(AgentsContext);
    if (!context) {
        throw new Error('useAgents must be used within an AgentsProvider');
    }
    return context;
}; 