import React from 'react';
import { Image as ImageIcon, Box, PlusCircle, Maximize2, Sparkles, Paperclip, ArrowUp, Palette, LayoutGrid } from 'lucide-react';

interface PromptBoxProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function PromptBox({ value, onChange, onSubmit, placeholder = "Describe your idea" }: PromptBoxProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div style={{
      backgroundColor: '#262626',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      {/* Top row: Input + Right icons */}
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: '16px' }}>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#FFFFFF',
            fontSize: '15px',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ display: 'flex', gap: '16px', color: '#9CA3AF', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Sparkles size={18} />
          </button>
          <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
      
      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#333333', width: '100%', marginBottom: '16px' }}></div>
      
      {/* Bottom row: Tools */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
            <ImageIcon size={18} color="#9CA3AF" /> Image
          </button>
          <button style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
            <Box size={18} color="#9CA3AF" /> Model
          </button>
          <button style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
            <PlusCircle size={18} color="#9CA3AF" /> Style
          </button>
          <button style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
            <div style={{ border: '1.5px solid #9CA3AF', borderRadius: '4px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: '#9CA3AF' }}>A</div> 
            Ratio
          </button>
          <button style={{ background: 'none', border: 'none', color: '#E5E7EB', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500' }}>
            <LayoutGrid size={18} color="#9CA3AF" /> Count
          </button>
          <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Palette size={18} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}>
            <Paperclip size={18} />
          </button>
          <button 
            onClick={onSubmit}
            style={{ 
              background: '#3A3A3A', 
              border: 'none', 
              color: '#FFFFFF', 
              width: '32px', height: '32px', 
              borderRadius: '16px', 
              cursor: 'pointer', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4A4A4A'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3A3A3A'}
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
