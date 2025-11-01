import React, { useState } from 'react';
import { generateTests, queryNLP } from '../api/client';

type GenerateState = 'idle' | 'uploading' | 'generating' | 'success' | 'error';

const StatusBadge = ({ status }: { status: string }) => {
  const colors = {
    Pass: 'bg-green-100 text-green-800',
    Fail: 'bg-red-100 text-red-800', 
    Warn: 'bg-yellow-100 text-yellow-800'
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200">×</button>
    </div>
  </div>
);

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  title?: string;
  tags?: string[];
  timestamp: Date;
}

export default function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<GenerateState>('idle');
  const [result, setResult] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatQuery, setChatQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setState('uploading');
      setFile(uploadedFile);
      setTimeout(() => setState('idle'), 500);
    }
  };

  const handleGenerate = async () => {
    setState('generating');
    setResult(null);
    
    try {
      const response = await generateTests({ file: file?.name || 'demo-file.json' });
      
      if (response.isMockData) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
      }
      
      setResult(response.data);
      setState('success');
    } catch (error) {
      console.error('Generation failed:', error);
      setState('error');
    }
  };

  const getButtonText = () => {
    switch (state) {
      case 'uploading': return 'Uploading...';
      case 'generating': return 'Generating...';
      default: return 'Generate Tests';
    }
  };

  const isButtonDisabled = state === 'uploading' || state === 'generating' || !file;

  const handleChatSubmit = async () => {
    if (!chatQuery.trim() || !result) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: chatQuery,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatLoading(true);
    setChatQuery('');
    
    try {
      const response = await queryNLP(chatQuery, {
        run_id: result.run_id,
        tests: result.tests
      });
      
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.data.body,
        title: response.data.title,
        tags: response.data.tags,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat query failed:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleChatKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit();
    }
  };

  return (
    <div className="p-6">
      {showToast && (
        <Toast 
          message="Generated using demo data" 
          onClose={() => setShowToast(false)} 
        />
      )}
      
      <h1 className="text-2xl font-semibold mb-6">Generate Tests</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Upload Dataset</label>
          <input
            type="file"
            accept=".json,.csv,.txt"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {file && (
            <p className="mt-2 text-sm text-green-600">✓ {file.name} uploaded</p>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isButtonDisabled}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {state === 'generating' && (
            <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {getButtonText()}
        </button>
      </div>

      {result && (
        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Test Results</h2>
            <div className="text-sm text-gray-500">
              <span className="mr-4">Run ID: {result.run_id}</span>
              <span>Seed: {result.seed}</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestion</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                {result.tests?.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{test.id}</td>
                    <td className="px-4 py-4 text-sm">{test.rule}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded text-xs ${
                        test.severity === 'High' ? 'bg-red-100 text-red-800' :
                        test.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {test.severity}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={test.status} />
                    </td>
                    <td className="px-4 py-4 text-sm max-w-xs truncate" title={test.evidence}>{test.evidence}</td>
                    <td className="px-4 py-4 text-sm max-w-xs truncate" title={test.suggestion}>{test.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {result && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold">AI Assistant</h2>
            <p className="text-sm text-gray-500 mt-1">Ask questions about your test results</p>
          </div>
          
          <div className="p-6">
            {/* Chat Messages */}
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {chatMessages.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <p className="mb-2">💬 Start a conversation about your test results</p>
                  <p className="text-sm">Try: "Summarize top compliance failures" or "How to fix the failures"</p>
                </div>
              )}
              
              {chatMessages.map((message) => (
                <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-3xl rounded-lg p-4 ${
                    message.type === 'user' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}>
                    {message.title && (
                      <h4 className="font-semibold mb-2">{message.title}</h4>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    {message.tags && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {message.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                      <span className="text-gray-600 dark:text-gray-300">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={chatQuery}
                onChange={(e) => setChatQuery(e.target.value)}
                onKeyPress={handleChatKeyPress}
                placeholder="Ask about your test results..."
                className="flex-1 p-3 border rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={chatLoading}
              />
              <button
                onClick={handleChatSubmit}
                disabled={!chatQuery.trim() || chatLoading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
