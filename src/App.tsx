/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Code, 
  PenTool, 
  Sliders, 
  FileText, 
  Layers, 
  Download, 
  Copy, 
  Trash2, 
  History, 
  Send, 
  Terminal, 
  ArrowRight, 
  Shuffle, 
  Check, 
  Loader2, 
  HelpCircle, 
  RefreshCw, 
  Briefcase,
  ExternalLink,
  Undo2,
  BookOpen,
  Languages,
  Eye,
  FileCode,
  CheckCheck,
  Flame,
  User,
  Wifi,
  Battery,
  Signal,
  ChevronRight,
  Info,
  Bell,
  Settings,
  X,
  LogOut,
  AppWindow,
  Cpu,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Interfaces
interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface Artifact {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'code' | 'prompt' | 'story' | 'analysis';
  version: number;
  createdAt: string;
}

interface Persona {
  id: string;
  name: string;
  role: string;
  icon: React.ReactNode;
  instruction: string;
  examplePrompt: string;
  color: string;
  bgClass: string;
  borderClass: string;
}

export default function App() {
  // Navigation: bottom task tabs
  const [activeTab, setActiveTab] = useState<'chat' | 'document' | 'prompt' | 'refiner' | 'canvas'>('chat');
  
  // Unread indicator for Canvas tab
  const [unreadArtifact, setUnreadArtifact] = useState<boolean>(false);

  // Profile Drawer
  const [showProfile, setShowProfile] = useState<boolean>(false);

  // AI Generation configuration
  const [temperature, setTemperature] = useState<number>(0.7);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.5-flash');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Chat tab state
  const [selectedPersona, setSelectedPersona] = useState<string>('code');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am your AI Architect and Creative Companion. I can help you design software architecture, write clean TypeScript/React code, compose Product Requirements Documents, or optimize your LLM prompts. Choose a specialist below or ask me any question!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Document Builder tab state
  const [docType, setDocType] = useState<'prd' | 'roadmap' | 'spec' | 'outline' | 'custom'>('prd');
  const [docTopic, setDocTopic] = useState<string>('');
  const [docCustomType, setDocCustomType] = useState<string>('');

  // Prompt Architect tab state
  const [promptInput, setPromptInput] = useState<string>('');
  const [promptFramework, setPromptFramework] = useState<'crispe' | 'few-shot' | 'rtfc'>('crispe');

  // Text Refiner tab state
  const [refinerInput, setRefinerInput] = useState<string>('');
  const [refinerAction, setRefinerAction] = useState<'summarize' | 'explain-like-5' | 'professional' | 'expand' | 'translate'>('summarize');
  const [refinerTargetLanguage, setRefinerTargetLanguage] = useState<string>('English');

  // Artifacts / Canvas history state
  const [artifacts, setArtifacts] = useState<Artifact[]>([
    {
      id: 'initial-art',
      title: 'Interactive Canvas Guide',
      type: 'markdown',
      version: 1,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `# Interactive Document Canvas\n\nWelcome to your Sandbox Workspace. When you generate requirements, templates, optimized prompts, or code in other tabs, the resulting rich artifacts open directly on this canvas.\n\n### Workspace Capabilities:\n- 📝 **Rich Preview**: Read beautifully formatted documents with code syntax highlighting.\n- 💻 **Source View**: Copy the raw Markdown layout in a single click.\n- ⏳ **Version History**: Every generation tracks previous runs, letting you roll back with ease.\n- 📥 **Instant Export**: Download your creations as clean local files instantly.\n\n### Try It Now:\n1. Open the **Spec** tab in the bottom menu.\n2. Choose the **PRD (Spec)** template.\n3. Enter a prompt like: *"Cozy smart coffee maker mobile app design"*.\n4. Click **Create Artifact** and watch it load in this canvas space!`
    }
  ]);
  const [activeArtifactId, setActiveArtifactId] = useState<string>('initial-art');
  const [canvasViewMode, setCanvasViewMode] = useState<'preview' | 'source'>('preview');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status Bar Clock
  const [timeString, setTimeString] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset unread status when opening the canvas
  useEffect(() => {
    if (activeTab === 'canvas') {
      setUnreadArtifact(false);
    }
  }, [activeTab]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Expert Personas
  const personas: Record<string, Persona> = {
    code: {
      id: 'code',
      name: 'Code Architect',
      role: 'Software design, API, & React hooks',
      icon: <Code className="w-5 h-5 text-indigo-600" />,
      color: 'indigo',
      bgClass: 'bg-indigo-50 hover:bg-indigo-100/70 border-indigo-200/50 text-indigo-950',
      borderClass: 'border-indigo-600',
      instruction: 'You are an elite software architect. Provide clean, production-ready, well-commented TypeScript/React code blocks, focus on software design patterns, and write detailed, readable explanations in English.',
      examplePrompt: 'Write a typed React hook for debouncing user inputs.'
    },
    copywriter: {
      id: 'copywriter',
      name: 'Creative Copywriter',
      role: 'Creative copy, branding & taglines',
      icon: <PenTool className="w-5 h-5 text-rose-600" />,
      color: 'rose',
      bgClass: 'bg-rose-50 hover:bg-rose-100/70 border-rose-200/50 text-rose-950',
      borderClass: 'border-rose-600',
      instruction: 'You are a world-class creative copywriter. Your tone is engaging, metaphorical, and memorable. Write catchy taglines, product copy, and persuasive landing page descriptions in English.',
      examplePrompt: 'Create 5 catchy taglines for a smart watch brand focused on mindfulness.'
    },
    prompt: {
      id: 'prompt',
      name: 'Prompt Engineer',
      role: 'Prompt optimization for LLMs',
      icon: <Sliders className="w-5 h-5 text-emerald-600" />,
      color: 'emerald',
      bgClass: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200/50 text-emerald-950',
      borderClass: 'border-emerald-600',
      instruction: 'You are a professional prompt engineer. Create highly robust, structured, and detailed system prompts with section separators, clear roles, negative constraints, and output examples.',
      examplePrompt: 'Create a system prompt for an agent that extracts transaction items from receipt uploads.'
    },
    product: {
      id: 'product',
      name: 'Product Manager',
      role: 'PRD templates, roadmaps & feature specs',
      icon: <Briefcase className="w-5 h-5 text-cyan-600" />,
      color: 'cyan',
      bgClass: 'bg-cyan-50 hover:bg-cyan-100/70 border-cyan-200/50 text-cyan-950',
      borderClass: 'border-cyan-600',
      instruction: 'You are an experienced Silicon Valley product manager. Focus on clear user stories, business success metrics, priority frameworks, and distinct MVP scope definitions in English.',
      examplePrompt: 'Draft the functional specification requirements for a collaborative shopping list MVP.'
    }
  };

  // Connect to server proxy
  const generateGeminiContent = async (
    prompt: string, 
    systemInstruction?: string
  ): Promise<string> => {
    setErrorMsg(null);
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction,
          model: selectedModel,
          config: {
            temperature,
            maxOutputTokens: 2500,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server-side generation failed.');
      }

      const data = await response.json();
      return data.text || '';
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Could not communicate with the server. Please check your network and try again.');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit dynamic message
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isGenerating) return;

    const userText = chatInput;
    setChatInput('');

    const newUserMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, newUserMsg]);

    try {
      const conversationHistory = chatHistory
        .concat(newUserMsg)
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n\n');

      const systemPrompt = personas[selectedPersona].instruction;
      const responseText = await generateGeminiContent(
        `This is the history of our conversation. Please respond to the last message, embodying your designated role. Write in English.\n\n${conversationHistory}`,
        systemPrompt
      );

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, aiMsg]);

      // If the message contains a substantial amount of markdown or code blocks, save it as an artifact automatically
      if (responseText.includes('```') || responseText.length > 350) {
        const titleMatch = userText.length > 25 ? userText.substring(0, 25) + '...' : userText;
        const isCodeBlock = responseText.includes('```typescript') || responseText.includes('```javascript') || responseText.includes('```css') || responseText.includes('```html') || responseText.includes('```json');
        
        addNewArtifact(
          titleMatch || 'Assistant Response',
          isCodeBlock ? 'code' : 'markdown',
          responseText
        );
      }
    } catch (err) {
      setChatHistory(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'assistant',
          text: `⚠️ **Generation Error:** ${err instanceof Error ? err.message : 'Could not reach the Gemini API.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Add standard artifact
  const addNewArtifact = (title: string, type: Artifact['type'], content: string) => {
    const existing = artifacts.find(a => a.title.toLowerCase() === title.toLowerCase());
    
    const newArt: Artifact = {
      id: `art-${Date.now()}`,
      title,
      type,
      content,
      version: existing ? existing.version + 1 : 1,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setArtifacts(prev => [newArt, ...prev]);
    setActiveArtifactId(newArt.id);
    setUnreadArtifact(true);
  };

  // Persona toggle
  const handlePersonaChange = (id: string) => {
    setSelectedPersona(id);
    const welcomeText = `Hello! I am your ${personas[id].name}. My role: ${personas[id].role}. Let me know what you are working on, or click the quick prompt suggestion below to get started!`;
    setChatHistory([
      {
        id: `welcome-${id}`,
        sender: 'assistant',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Generate Document Action
  const handleGenerateDocument = async () => {
    if (!docTopic.trim() || isGenerating) return;

    let docTypeName = '';
    let systemPrompt = '';
    
    switch (docType) {
      case 'prd':
        docTypeName = 'Product Requirements Document (PRD)';
        systemPrompt = 'You are an experienced product manager. Generate a highly detailed Product Requirements Document (PRD) in English. Use clean Markdown formatting. Include sections: 1. Project Background & Problem Statement, 2. Target Persona & User Stories, 3. Functional Requirements (presented in a beautiful styled table), 4. Key Success Metrics (KPIs), 5. Out of Scope for MVP. Start your output directly with the document title level 1 heading (#), with no preambles.';
        break;
      case 'roadmap':
        docTypeName = 'Strategic Product Roadmap';
        systemPrompt = 'You are a Chief Technology Officer (CTO). Write a strategic product roadmap in English using Markdown formatting. Detail phases: Now, Next, and Later. Highlight key technical milestones, major features, architectural risks, and dependency graphs. Start your output directly with a level 1 heading (#).';
        break;
      case 'spec':
        docTypeName = 'Architectural Specification';
        systemPrompt = 'You are a Principal Software Architect. Generate a detailed, professional architectural design specification in English using Markdown formatting. Detail: 1. System Topology Overview, 2. Entity Relationship DB Schema details, 3. Core API endpoint routing specifications (REST/JSON) with payload examples, 4. Security & Data sanitization measures. Start your output directly with a level 1 heading (#).';
        break;
      case 'outline':
        docTypeName = 'Project Scope & Work Breakdown';
        systemPrompt = 'You are a veteran Project Director. Outline a structured project execution roadmap in English using Markdown: 1. Project Work Breakdown Structure (WBS), 2. Comprehensive Risk Assessment Matrix (likelihood, impact, and mitigation strategies), 3. Critical Resource Allocations. Start immediately with a level 1 heading (#).';
        break;
      case 'custom':
        docTypeName = docCustomType ? docCustomType : 'Document';
        systemPrompt = `You are an expert technical writer. Write a comprehensive, well-structured document about "${docTypeName}" in English using elegant Markdown format, complete with details, checklists, or data tables. Start immediately with a level 1 heading (#).`;
        break;
    }

    const prompt = `Write a professional document "${docTypeName}" for the following topic or product concept: "${docTopic}". You must use deep Markdown layout, organized list components, italicized quotes, and detailed columns in tables. Write entirely in English.`;

    try {
      const resultText = await generateGeminiContent(prompt, systemPrompt);
      addNewArtifact(
        `${docTopic.length > 20 ? docTopic.substring(0, 20) + '...' : docTopic} (${docType.toUpperCase()})`,
        'markdown',
        resultText
      );
      setActiveTab('canvas');
    } catch (err) {
      // handled via UI block
    }
  };

  // Optimize Prompts
  const handleGeneratePrompt = async () => {
    if (!promptInput.trim() || isGenerating) return;

    let systemPrompt = 'You are a distinguished Prompt Engineer. Write the ultimate LLM system prompt instructions in English using structured Markdown formatting.';
    let prompt = '';

    if (promptFramework === 'crispe') {
      prompt = `Optimize the following draft prompt using the CRISPE framework (Capacity, Role, Instruction, Schema, Positive/Negative Constraints, Examples). Format the output as a clean, production-ready instruction sheet in Markdown, highlighting user parameter placeholders in square brackets. Draft prompt: "${promptInput}"`;
    } else if (promptFramework === 'few-shot') {
      prompt = `Enhance the following prompt by writing 3 high-quality, diverse input-output examples (Few-Shot Prompting). Present the complete prompt layout inside Markdown, framing the example scenarios cleanly inside nested code blocks. Draft prompt: "${promptInput}"`;
    } else {
      prompt = `Re-architect this prompt using the RTFC methodology (Role, Task, Format, Constraints). Make it highly predictable, robust, and easy to copy directly into API config parameters. Draft prompt: "${promptInput}"`;
    }

    try {
      const resultText = await generateGeminiContent(prompt, systemPrompt);
      addNewArtifact(
        `Prompt (${promptFramework.toUpperCase()})`,
        'prompt',
        resultText
      );
      setActiveTab('canvas');
    } catch (err) {
      // handled via UI
    }
  };

  // Refine text
  const handleRefineText = async () => {
    if (!refinerInput.trim() || isGenerating) return;

    let systemPrompt = 'You are a professional copy editor. Provide ONLY the polished and enhanced text directly, with absolutely no chat commentary, preamble, or final notes.';
    let prompt = '';

    switch (refinerAction) {
      case 'summarize':
        prompt = `Analyze the following text and write a structured Markdown summary: include a bulleted list of 5 key strategic takeaways followed by a concise 1-sentence high-level summary at the very end.\n\nText:\n"${refinerInput}"`;
        break;
      case 'explain-like-5':
        prompt = `Explain the complex concepts, technical jargon, or theories in this text in very simple words using intuitive real-life analogies, written so a 5-year-old could easily grasp it.\n\nText:\n"${refinerInput}"`;
        break;
      case 'professional':
        prompt = `Rewrite the following text into a high-level, authoritative, and elegant business corporate style. Enhance the professional lexicon, remove passive phrasing, and improve the sentence rhythm.\n\nText:\n"${refinerInput}"`;
        break;
      case 'expand':
        prompt = `Expand this text into a comprehensive technical brief, building out deep situational context, adding industry standard considerations, and suggesting roadmap steps.\n\nText:\n"${refinerInput}"`;
        break;
      case 'translate':
        prompt = `Translate the following text into fluent ${refinerTargetLanguage}, ensuring all original tone, intent, and Markdown styling details are preserved perfectly.\n\nText:\n"${refinerInput}"`;
        break;
    }

    try {
      const resultText = await generateGeminiContent(prompt, systemPrompt);
      addNewArtifact(
        `Editor (${refinerAction.toUpperCase()})`,
        'analysis',
        resultText
      );
      setActiveTab('canvas');
    } catch (err) {
      // handled via UI
    }
  };

  const activeArtifact = artifacts.find(a => a.id === activeArtifactId) || artifacts[0];

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadArtifact = (art: Artifact) => {
    const element = document.createElement("a");
    const file = new Blob([art.content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    
    const sanitizedTitle = art.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const extension = art.type === 'code' ? 'ts' : 'md';
    element.download = `${sanitizedTitle}_v${art.version}.${extension}`;
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Custom high-quality markdown line parser to present artifacts in beauty
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];
    let codeBlockLanguage = '';
    const renderedElements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code Block Detection
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          const codeContent = codeBlockLines.join('\n');
          const lang = codeBlockLanguage;
          const blockId = `code-block-${i}`;
          renderedElements.push(
            <div key={blockId} className="my-4 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-900 shadow-md text-xs font-mono">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-300 select-none border-b border-slate-700">
                <span className="font-mono text-xs text-indigo-400 font-bold uppercase">{lang || 'code'}</span>
                <button 
                  onClick={() => copyToClipboard(codeContent, blockId)}
                  className="flex items-center gap-1.5 hover:text-white transition-colors text-xs font-semibold"
                >
                  {copiedId === blockId ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-100 leading-relaxed bg-slate-950/85">
                <code>{codeContent}</code>
              </pre>
            </div>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLanguage = line.trim().substring(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        continue;
      }

      if (line.trim() === '---') {
        renderedElements.push(<hr key={`divider-${i}`} className="my-5 border-t border-slate-200" />);
        continue;
      }

      // Headers (Increasing sizes for better readability!)
      if (line.trim().startsWith('# ')) {
        renderedElements.push(
          <h1 key={`h1-${i}`} className="text-2xl font-extrabold text-slate-900 tracking-tight mt-6 mb-3 font-sans border-b border-slate-100 pb-2">
            {line.substring(2)}
          </h1>
        );
        continue;
      }
      if (line.trim().startsWith('## ')) {
        renderedElements.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-slate-800 tracking-tight mt-5 mb-2.5 font-sans">
            {line.substring(3)}
          </h2>
        );
        continue;
      }
      if (line.trim().startsWith('### ')) {
        renderedElements.push(
          <h3 key={`h3-${i}`} className="text-base font-semibold text-slate-800 mt-4 mb-2 font-sans">
            {line.substring(4)}
          </h3>
        );
        continue;
      }

      // Blockquotes
      if (line.trim().startsWith('> ')) {
        renderedElements.push(
          <blockquote key={`quote-${i}`} className="pl-4 border-l-4 border-indigo-600 italic text-slate-600 bg-slate-50 py-2.5 px-3.5 my-3 rounded-r-lg text-sm">
            {line.substring(2)}
          </blockquote>
        );
        continue;
      }

      // Bullet lists
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const cleanText = line.trim().substring(2);
        renderedElements.push(
          <li key={`li-${i}`} className="ml-5 list-disc text-slate-700 leading-relaxed my-1.5 text-sm">
            {parseInlineStyling(cleanText)}
          </li>
        );
        continue;
      }

      // Numbered lists
      const numberMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numberMatch) {
        renderedElements.push(
          <li key={`num-li-${i}`} className="ml-5 list-decimal text-slate-700 leading-relaxed my-1.5 text-sm" style={{ listStyleType: 'decimal' }}>
            {parseInlineStyling(numberMatch[2])}
          </li>
        );
        continue;
      }

      if (line.trim() === '') {
        renderedElements.push(<div key={`space-${i}`} className="h-3" />);
        continue;
      }

      // Standard paragraph (using text-sm for native cozy reading)
      renderedElements.push(
        <p key={`p-${i}`} className="text-slate-700 leading-relaxed my-2 text-sm font-sans font-normal">
          {parseInlineStyling(line)}
        </p>
      );
    }

    return renderedElements;
  };

  // Bold, Italic, Inline Code parser
  const parseInlineStyling = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3|(`)(.*?)\5/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      const matchIndex = match.index;

      if (matchIndex > currentIndex) {
        parts.push(text.substring(currentIndex, matchIndex));
      }

      if (match[2]) {
        parts.push(<strong key={`bold-${matchIndex}`} className="font-bold text-slate-900">{match[2]}</strong>);
      } else if (match[4]) {
        parts.push(<em key={`italic-${matchIndex}`} className="italic text-slate-800">{match[4]}</em>);
      } else if (match[6]) {
        parts.push(<code key={`inline-code-${matchIndex}`} className="px-1.5 py-0.5 rounded bg-slate-100 text-indigo-600 font-mono text-xs border border-slate-200/80 font-medium">{match[6]}</code>);
      }

      currentIndex = regex.lastIndex;
    }

    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div id="studio-root" className="min-h-screen bg-slate-100 text-slate-900 flex flex-col items-center justify-center font-sans py-2 px-1 sm:py-6 sm:px-4 overflow-x-hidden relative">
      
      {/* Decorative Grid Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-50"></div>

      {/* Main Container - Full viewport on Mobile, Beautiful Sleek Phone on Desktop */}
      <div 
        id="phone-wrapper" 
        className="w-full h-screen sm:h-[840px] sm:max-w-[410px] sm:rounded-[56px] sm:p-3 bg-slate-950 sm:shadow-2xl relative sm:border-8 sm:border-slate-800 ring-1 ring-slate-950/20 flex flex-col z-10 transition-all duration-300"
      >
        {/* Notch details for Desktop preview */}
        <div className="hidden sm:block w-32 h-6 bg-slate-950 rounded-b-3xl mx-auto absolute top-2 left-1/2 -translate-x-1/2 z-50">
          <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mt-1"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900/80 mx-auto mt-1 flex items-center justify-center border border-slate-800">
            <div className="w-1 h-1 rounded-full bg-indigo-900/50"></div>
          </div>
        </div>

        {/* Dynamic Status Bar */}
        <div id="android-status-bar" className="flex justify-between items-center px-6 pt-4 pb-2 text-xs font-bold text-slate-700 bg-white select-none sm:rounded-t-[44px] z-40 shrink-0">
          <span className="tracking-tight font-sans font-semibold text-slate-800">{timeString}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4 text-slate-800" />
            <Wifi className="w-4 h-4 text-slate-800" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold text-slate-800">95%</span>
              <Battery className="w-4 h-4 text-slate-800" />
            </div>
          </div>
        </div>

        {/* Device Content Screen Viewport */}
        <div id="app-viewport" className="flex-1 bg-white flex flex-col overflow-hidden relative sm:rounded-b-[44px]">
          
          {/* Main Top Header - Unified and Clean */}
          <header id="phone-header" className="border-b border-slate-100 bg-white px-5 py-4 flex items-center justify-between shrink-0 select-none z-30 shadow-sm/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight leading-none">
                  Gemini Studio
                </h1>
                <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">Creative Mobile Suite</span>
              </div>
            </div>

            {/* Profile Avatar on the Right side of headers */}
            <button 
              onClick={() => setShowProfile(true)}
              className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-extrabold text-xs flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer relative shrink-0"
              title="Profile"
              id="profile-trigger"
            >
              WH
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white"></span>
            </button>
          </header>

          {/* Mini Parameters Toolbar */}
          <div className="bg-slate-50 border-b border-slate-100/80 px-5 py-2.5 flex items-center justify-between shrink-0 select-none text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-semibold">Model:</span>
              <span className="text-slate-800 font-bold bg-slate-200/60 px-1.5 py-0.5 rounded text-[10px]">{selectedModel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="text-slate-400 font-semibold">Temp:</span>
              <span className="text-slate-800 font-mono font-bold">{temperature.toFixed(1)}</span>
            </div>
          </div>

          {/* Primary Viewport Area */}
          <div id="screen-body" className="flex-1 overflow-y-auto p-4 sm:p-5 relative bg-white flex flex-col">
            <AnimatePresence mode="wait">
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2.5 shadow-sm"
                >
                  <span className="font-bold shrink-0">Error:</span>
                  <p className="flex-1 leading-snug text-xs font-semibold">{errorMsg}</p>
                  <button onClick={() => setErrorMsg(null)} className="font-extrabold hover:text-red-900 text-base">×</button>
                </motion.div>
              )}

              {/* VIEW 1: CREATIVE CHAT */}
              {activeTab === 'chat' && (
                <motion.div 
                  key="chat-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full"
                >
                  {/* Persona Selection Bar */}
                  <div className="mb-4 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select AI Specialist</span>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                      {Object.values(personas).map((pers) => (
                        <button
                          key={pers.id}
                          onClick={() => handlePersonaChange(pers.id)}
                          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold shrink-0 transition-all snap-start shadow-sm/50 ${
                            selectedPersona === pers.id
                              ? 'bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {pers.icon}
                          <span>{pers.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Messages container (Clean bubbles and easily readable) */}
                  <div className="flex-1 min-h-[220px] bg-slate-50/70 border border-slate-200/50 rounded-2xl p-4 overflow-y-auto flex flex-col gap-4 mb-4 scrollbar-thin">
                    {chatHistory.map((msg) => (
                      <div 
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
                        }`}
                      >
                        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100'
                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-sm font-sans'
                        }`}>
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1 font-semibold">{msg.timestamp}</span>
                      </div>
                    ))}
                    {isGenerating && (
                      <div className="self-start flex items-center gap-2 text-slate-500 bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span className="text-xs font-semibold">AI is typing...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Dynamic prompt suggestion (Bigger interactive area) */}
                  <div className="mb-4 shrink-0">
                    <button
                      onClick={() => setChatInput(personas[selectedPersona].examplePrompt)}
                      className="text-left w-full p-3.5 rounded-xl border border-dashed border-slate-200 bg-slate-50 hover:bg-indigo-50/40 hover:border-indigo-300 transition-all text-xs text-slate-600 flex items-start gap-2.5 group cursor-pointer"
                    >
                      <Shuffle className="w-4 h-4 text-indigo-500 mt-0.5 group-hover:rotate-12 transition-transform shrink-0" />
                      <div className="flex-1 font-medium">
                        <span className="block text-[10px] text-slate-400 font-bold uppercase mb-0.5">Try quick suggestion:</span>
                        <span className="italic">"{personas[selectedPersona].examplePrompt}"</span>
                      </div>
                    </button>
                  </div>

                  {/* Input form */}
                  <form onSubmit={handleSendChatMessage} className="flex gap-2 shrink-0">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Message ${personas[selectedPersona].name}...`}
                      disabled={isGenerating}
                      className="flex-1 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 px-4 py-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all h-11"
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !chatInput.trim()}
                      className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-md shadow-indigo-100 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* VIEW 2: DOCUMENT BUILDER */}
              {activeTab === 'document' && (
                <motion.div 
                  key="document-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <FileCode className="w-4.5 h-4.5 text-indigo-600" />
                      Specs & Docs Builder
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Generate structured product requirements documents, project roadmaps, or custom technical briefs.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Document Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setDocType('prd')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          docType === 'prd'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs block font-bold">PRD (Spec)</span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Full Product Spec</span>
                      </button>
                      <button
                        onClick={() => setDocType('roadmap')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          docType === 'roadmap'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs block font-bold">Roadmap</span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Strategic Plan</span>
                      </button>
                      <button
                        onClick={() => setDocType('spec')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          docType === 'spec'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs block font-bold">Architecture Spec</span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">DB, API & topology</span>
                      </button>
                      <button
                        onClick={() => setDocType('custom')}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          docType === 'custom'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="text-xs block font-bold">Custom Type</span>
                        <span className="text-[10px] text-slate-400 block font-normal mt-0.5">Provide custom title</span>
                      </button>
                    </div>
                  </div>

                  {docType === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Custom Title</label>
                      <input
                        type="text"
                        value={docCustomType}
                        onChange={(e) => setDocCustomType(e.target.value)}
                        placeholder="E.g., Competitor Analysis"
                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-600 transition-all"
                      />
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Describe the topic or project</label>
                    <textarea
                      rows={4}
                      value={docTopic}
                      onChange={(e) => setDocTopic(e.target.value)}
                      placeholder="E.g., A shared family budget planning app for iOS and Android with real-time push alerts..."
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 px-3.5 py-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleGenerateDocument}
                    disabled={isGenerating || !docTopic.trim()}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating artifact...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Create Artifact</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* VIEW 3: PROMPT ARCHITECT */}
              {activeTab === 'prompt' && (
                <motion.div 
                  key="prompt-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Sliders className="w-4.5 h-4.5 text-indigo-600" />
                      Prompt Architect
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Transform casual raw queries into highly reliable, structured instructions utilizing top framework designs.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Framework</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setPromptFramework('crispe')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          promptFramework === 'crispe'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs block font-bold">CRISPE</span>
                      </button>
                      <button
                        onClick={() => setPromptFramework('few-shot')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          promptFramework === 'few-shot'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs block font-bold">Few-Shot</span>
                      </button>
                      <button
                        onClick={() => setPromptFramework('rtfc')}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          promptFramework === 'rtfc'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-sm'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <span className="text-xs block font-bold">RTFC</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Draft Query</label>
                    <textarea
                      rows={5}
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      placeholder="E.g., Extract transaction data and currencies from coffee receipts..."
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 px-3.5 py-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleGeneratePrompt}
                    disabled={isGenerating || !promptInput.trim()}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Designing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Build Prompt</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* VIEW 4: TEXT REFINER */}
              {activeTab === 'refiner' && (
                <motion.div 
                  key="refiner-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Languages className="w-4.5 h-4.5 text-indigo-600" />
                      Copy Editor
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Summarize text, improve tone, explain complex ideas simply, or translate documents instantly.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Select Action</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'summarize', label: 'Key Summary' },
                        { id: 'explain-like-5', label: "Explain Like I'm 5" },
                        { id: 'professional', label: 'Professional Tone' },
                        { id: 'translate', label: 'Translate Text' }
                      ].map((act) => (
                        <button
                          key={act.id}
                          onClick={() => setRefinerAction(act.id as any)}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            refinerAction === act.id
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold shadow-sm'
                              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-xs block font-bold">{act.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {refinerAction === 'translate' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-1.5"
                    >
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Language</label>
                      <select
                        value={refinerTargetLanguage}
                        onChange={(e) => setRefinerTargetLanguage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-xl text-sm outline-none focus:bg-white focus:border-indigo-600 font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="English">English 🇺🇸</option>
                        <option value="Russian">Russian 🇷🇺</option>
                        <option value="Spanish">Spanish 🇪🇸</option>
                        <option value="French">French 🇫🇷</option>
                        <option value="German">German 🇩🇪</option>
                        <option value="Chinese">Chinese 🇨🇳</option>
                        <option value="Japanese">Japanese 🇯🇵</option>
                      </select>
                    </motion.div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Source Text</label>
                    <textarea
                      rows={4}
                      value={refinerInput}
                      onChange={(e) => setRefinerInput(e.target.value)}
                      placeholder="Paste any draft, transcription, or raw text here to edit..."
                      className="w-full bg-slate-50 hover:bg-slate-100/50 border border-slate-200 px-3.5 py-3 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 outline-none transition-all resize-none leading-relaxed"
                    />
                  </div>

                  <button
                    onClick={handleRefineText}
                    disabled={isGenerating || !refinerInput.trim()}
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 text-white disabled:text-slate-400 font-bold text-xs tracking-wider uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Refining copy...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Refine Text</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* VIEW 5: DYNAMIC ARTIFACT CANVAS */}
              {activeTab === 'canvas' && (
                <motion.div 
                  key="canvas-tab"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col h-full space-y-4"
                >
                  {/* Title & metadata bar */}
                  <div className="border-b border-slate-100 pb-3 flex items-start justify-between gap-2 select-none">
                    <div className="flex items-start gap-2.5 max-w-[70%]">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                        <FileText className="w-4.5 h-4.5" />
                      </div>
                      <div className="truncate">
                        <h2 className="text-sm font-bold text-slate-900 leading-tight truncate">{activeArtifact.title}</h2>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block mt-1">Version {activeArtifact.version}</span>
                      </div>
                    </div>

                    {/* Copy and download buttons (Min 44px touch targets) */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyToClipboard(activeArtifact.content, 'canvas-copy')}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer relative"
                        title="Copy All"
                      >
                        {copiedId === 'canvas-copy' ? (
                          <CheckCheck className="w-4.5 h-4.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-4.5 h-4.5" />
                        )}
                      </button>

                      <button
                        onClick={() => downloadArtifact(activeArtifact)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer"
                        title="Download File"
                      >
                        <Download className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Version Rollback Selector */}
                  {artifacts.length > 1 && (
                    <div className="flex items-center gap-2 select-none overflow-x-auto pb-2 scrollbar-none shrink-0 border-b border-slate-100">
                      <History className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="flex items-center gap-1.5">
                        {artifacts.map((art) => (
                          <button
                            key={art.id}
                            onClick={() => setActiveArtifactId(art.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all shrink-0 border ${
                              art.id === activeArtifactId
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            Version {art.version}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* View modes toggle (Preview / Source) */}
                  <div className="flex items-center justify-between shrink-0 select-none bg-slate-100/70 p-1.5 rounded-xl border border-slate-200/50">
                    <button 
                      onClick={() => setCanvasViewMode('preview')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        canvasViewMode === 'preview'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button 
                      onClick={() => setCanvasViewMode('source')}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                        canvasViewMode === 'source'
                          ? 'bg-white text-indigo-600 shadow-sm'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Terminal className="w-4 h-4" />
                      Source
                    </button>
                  </div>

                  {/* Document Body Viewport (Comfortable fonts!) */}
                  <div className="flex-1 overflow-y-auto p-1 bg-white scrollbar-thin">
                    <AnimatePresence mode="wait">
                      {canvasViewMode === 'preview' ? (
                        <motion.div 
                           key="preview-canvas"
                           initial={{ opacity: 0 }}
                           animate={{ opacity: 1 }}
                           className="prose prose-slate max-w-full text-slate-800"
                        >
                          {renderMarkdown(activeArtifact.content)}
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="source-canvas"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="h-full"
                        >
                          <textarea
                            readOnly
                            value={activeArtifact.content}
                            className="w-full h-full p-4 border border-slate-200 rounded-2xl bg-slate-50/50 font-mono text-xs text-slate-600 outline-none resize-none focus:ring-0 leading-relaxed"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Android App Bottom Task Navigation Menu (Comfortable, legible, beautifully polished) */}
          <nav id="phone-nav-bar" className="border-t border-slate-100 bg-white px-2 py-2.5 flex items-center justify-around shrink-0 select-none z-30 shadow-lg">
            {/* Tab 1: Chat */}
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === 'chat' 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/50 scale-[1.03]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              id="tab-chat"
            >
              <Sparkles className="w-5.5 h-5.5" />
              <span className="text-xs tracking-tight font-bold">Chat</span>
            </button>

            {/* Tab 2: Document Builder */}
            <button 
              onClick={() => setActiveTab('document')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === 'document' 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/50 scale-[1.03]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              id="tab-document"
            >
              <FileText className="w-5.5 h-5.5" />
              <span className="text-xs tracking-tight font-bold">Spec</span>
            </button>

            {/* Tab 3: Prompts */}
            <button 
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === 'prompt' 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/50 scale-[1.03]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              id="tab-prompt"
            >
              <Sliders className="w-5.5 h-5.5" />
              <span className="text-xs tracking-tight font-bold">Prompts</span>
            </button>

            {/* Tab 4: Refiner */}
            <button 
              onClick={() => setActiveTab('refiner')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === 'refiner' 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/50 scale-[1.03]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              id="tab-refiner"
            >
              <Languages className="w-5.5 h-5.5" />
              <span className="text-xs tracking-tight font-bold">Editor</span>
            </button>

            {/* Tab 5: Canvas (Documents Reader) */}
            <button 
              onClick={() => setActiveTab('canvas')}
              className={`flex-1 flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-2xl transition-all cursor-pointer relative ${
                activeTab === 'canvas' 
                  ? 'text-indigo-600 font-extrabold bg-indigo-50/50 scale-[1.03]' 
                  : 'text-slate-400 hover:text-slate-700'
              }`}
              id="tab-canvas"
            >
              <Layers className="w-5.5 h-5.5" />
              <span className="text-xs tracking-tight font-bold">Canvas</span>

              {/* Unread indicator dot */}
              {unreadArtifact && (
                <span className="absolute top-1.5 right-4 w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse border-2 border-white"></span>
              )}
            </button>
          </nav>

          {/* Android Navigation Pill indicator */}
          <div className="h-4 bg-white flex items-center justify-center shrink-0 select-none z-30 sm:rounded-b-[44px]">
            <div className="w-28 h-1.5 bg-slate-200 rounded-full"></div>
          </div>

        </div>

        {/* Dynamic User Profile Modal / slide-out details */}
        <AnimatePresence>
          {showProfile && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/45 sm:rounded-[44px] flex items-end justify-center z-50 p-2"
            >
              {/* Profile Card details */}
              <motion.div 
                initial={{ y: 120 }}
                animate={{ y: 0 }}
                exit={{ y: 120 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                className="w-full bg-white rounded-[32px] p-6 shadow-2xl space-y-5 border border-slate-100"
              >
                {/* Profile header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                      WH
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-tight">WooHooHooh</h3>
                      <p className="text-xs font-bold text-slate-400">woohoohooh@gmail.com</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowProfile(false)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <hr className="border-slate-100" />

                {/* Profile quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                    <span className="text-lg font-black text-indigo-600 block">{artifacts.length}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Artifacts</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl text-center border border-slate-100/50">
                    <span className="text-lg font-black text-indigo-600 block">{chatHistory.length - 1}</span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">AI Queries</span>
                  </div>
                </div>

                {/* Status card */}
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-medium border border-slate-100/50">
                  <p className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info className="w-4.5 h-4.5 text-indigo-600" />
                    Creative Workspace
                  </p>
                  <p>All neural network requests are securely processed via official APIs. Generated documents are saved to local history.</p>
                </div>

                {/* Close trigger */}
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                >
                  Close Profile
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
